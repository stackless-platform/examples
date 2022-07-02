import {
    system,
    createUuid,
    Message,
    Data,
    Service
} from "warp-runtime";

export class Exercise extends Data {
    user: User;
    description: string;
    duration: number;
    date: Date;

    constructor(user: User, description: string, duration: number, date: Date) {
        super(createUuid(false));

        if (!user || !(user instanceof User))
            throw new Error("user is invalid");

        if (!description || typeof description !== 'string')
            throw new Error("description is invalid");

        if (typeof duration !== 'number' || duration < 1)
            throw new Error("duration is invalid");

        if (!date || !(date instanceof Date))
            throw new Error("date is invalid");

        this.user = user;
        this.description = description;
        this.duration = duration;
        this.date = date;

        console.log(`Exercise ${this.primaryKey} created`);
    }
}

export class ExerciseAdded extends Message {
    exercise: Exercise;
    constructor(exercise: Exercise) {
        super();
        if (!exercise || !(exercise instanceof Exercise))
            throw new Error("invalid exercise");
        this.exercise = exercise;
        console.log(`ExerciseAdded created for Exercise ${this.exercise.primaryKey}`);
    }
}

export class User extends Data {
    username: string;
    constructor(username: string) {
        super(username);

        if (!username || typeof username != 'string')
            throw new Error("username is missing");

        username = username.trim()

        if (username.length < 3)
            throw new Error("username is too short");

        if (username.length > 50)
            throw new Error("username is too long");

        this.username = username;
        console.log(`User ${this.primaryKey} created`);
    }
}

export class ExerciseTrackerService extends Service {
    private _userIndex: Set<string>;
    private _exerciseIndex: Set<string>;

    constructor(primaryKey: string) {
        super(primaryKey);
        this._userIndex = new Set();
        this._exerciseIndex = new Set();

        console.log(`ExerciseTrackerService ${this.primaryKey} created`);
    }

    deleteUser(user: User) {
        this._userIndex.delete(user.primaryKey);
        system.delete(user);
        console.log(`User ${user.primaryKey} deleted`);
    }

    addUser(username: string): User {
        if (this._userIndex.has(username)) {
            console.error(`Failed to add user ${username} because one already exists with that name.`);
            throw new Error("A user with that name already exists");
        }
        const user = new User(username);
        system.saveData(user);
        this._userIndex.add(user.primaryKey);
        console.log(`User ${user.primaryKey} added successfully`);
        return user;
    }

    userExists(username: string): boolean {
        return this._userIndex.has(username);
    }

    tryGetUser(username: string): User | null {
        if (this._userIndex.has(username))
            return system.getData(User, username);
        return null;
    }

    getUsers(): User[] {
        let users: User[] = [];
        for (const pk of this._userIndex)
            users.push(system.getData(User, pk));
        return users;
    }

    addExercise(exercise: Exercise) {
        if (!exercise || !(exercise instanceof Exercise)) {
            console.error(`Failed to add exercise because ${JSON.stringify(exercise)} was invalid`);
            throw new Error('Exercise was invalid');
        }
        if (this._exerciseIndex.has(exercise.primaryKey)) {
            throw new Error(`Exercise ${exercise.primaryKey} already exists`);
        }
        system.saveData(exercise);
        this._exerciseIndex.add(exercise.primaryKey);
        console.log(`The user ${exercise.user.username} added the exercise ${exercise.primaryKey} successfully`);
        system.sendMessage(this, new ExerciseAdded(exercise));
    }

    deleteExercise(primaryKey: string) {
        const exercise = system.getData(Exercise, primaryKey);
        if (exercise) {
            this._exerciseIndex.delete(exercise.primaryKey);
            system.delete(exercise);
            console.log(`Exercise ${primaryKey} deleted successfully`);
        } else {
            console.error(`Failed to delete exercise ${primaryKey} because it does not exist`);
            throw new Error('Failed to delete exercise because it does not exist');
        }
    }

    getMaxDuration(): number | null {
        let max: number | null = null;
        for (const pk of this._exerciseIndex) {
            const exercise = system.getData(Exercise, pk);
            if (!max || exercise.duration > max)
                max = exercise.duration;
        }
        return max;
    }

    getExercises(): Exercise[] {
        let exercises: Exercise[] = [];
        for (const pk of this._exerciseIndex) {
            exercises.push(system.getData(Exercise, pk));
        }
        return exercises;
    }
}