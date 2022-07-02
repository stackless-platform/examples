import {
    system,
    createUuid,
    Message,
    Data,
    Service
} from "./warp-runtime";

class Exercise extends Data {
    constructor(user, description, duration, date) {
        super(createUuid(false));
        this.user = user;
        this.description = description;
        this.duration = duration;
        this.date = date;
        console.log(`Exercise ${this.primaryKey} created`);
    }

    get user() {
        return this._user;
    }

    set user(value) {
        if (!value || !value instanceof User)
            throw new Error("user is invalid");
        this._user = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        if (!value || typeof value !== 'string')
            throw new Error("description is invalid");
        this._description = value;
    }

    get duration() {
        return this._duration;
    }

    set duration(value) {
        if (typeof value !== 'number' || value < 1)
            throw new Error("duration is invalid");
        this._duration = value;
    }

    get date() {
        return this._date;
    }

    set date(value) {
        if (!value || !value instanceof Date)
            throw new Error("date is invalid");
        this._date = value;
    }
}

class ExerciseAdded extends Message {
    constructor(exercise) {
        super();
        this.exercise = exercise;
        console.log(`ExerciseAdded created for Exercise ${this.exercise.primaryKey}`);
    }
}

class User extends Data {
    constructor(username) {
        super(username);
        this.username = username;
        console.log(`User ${this.primaryKey} created`);
    }

    get username() {
        return this._username;
    }

    set username(value) {
        if (!value || typeof value != 'string')
            throw new Error("username is missing");
        value = value.trim()
        if (value.length < 3)
            throw new Error("username is too short");
        if (value.length > 50)
            throw new Error("username is too long");
        this._username = value;
    }
}

class ExerciseTrackerService extends Service {
    constructor(primaryKey) {
        super(primaryKey);
        this._userIndex = new Set();
        this._exerciseIndex = new Set();
        console.log(`ExerciseTrackerService ${this.primaryKey} created`);
    }

    deleteUser(user) {
        this._userIndex.delete(user.primaryKey);
        system.delete(user);
        console.log(`User ${user.primaryKey} deleted`);
    }

    addUser(username) {
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

    userExists(username) {
        return this._userIndex.has(username);
    }

    tryGetUser(username) {
        if (this._userIndex.has(username))
            return system.getData(User, username);
        return null;
    }

    getUsers() {
        let users = [];
        for (const pk of this._userIndex)
            users.push(system.getData(User, pk));
        return users;
    }

    addExercise(exercise) {
        if (!exercise || !exercise instanceof Exercise) {
            console.error(`Failed to add exercise because ${JSON.stringify(exercise)} was invalid`);
            throw new Error('Exercise was invalid');
        }
        system.saveData(exercise);
        this._exerciseIndex.add(exercise.primaryKey);
        console.log(`The user ${exercise.user.username} added the exercise ${exercise.primaryKey} successfully`);
        system.sendMessage(this, new ExerciseAdded(exercise));
    }

    deleteExercise(primaryKey) {
        const exercise = system.getData(Exercise, primaryKey);
        if(exercise) {
            this._exerciseIndex.delete(exercise.primaryKey);
            system.delete(exercise);
            console.log(`Exercise ${primaryKey} deleted successfully`);
        } else {
            console.error(`Failed to delete exercise ${primaryKey} because it does not exist`);
            throw new Error('Failed to delete exercise because it does not exist');
        }
    }

    getMaxDuration() {
        let max = null;
        for (const pk of this._exerciseIndex) {
            const exercise = system.getData(Exercise, pk);
            if (!max || exercise.duration > max)
                max = exercise.duration;
        }
        return max;
    }

    getExercises() {
        let exercises = [];
        for (const pk of this._exerciseIndex) {
            exercises.push(system.getData(Exercise, pk));
        }
        return exercises;
    }
}
