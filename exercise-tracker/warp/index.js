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
    }
}

class ExerciseAdded extends Message {
    constructor(exercise) {
        super();
        this.exercise = exercise;
    }
}

class User extends Data {
    constructor(username) {
        super(username);
        this.username = username;
    }
}

class ExerciseTrackerService extends Service {
    constructor(primaryKey) {
        super(primaryKey);
        this._userIndex = new Set();
        this._exerciseIndex = new Set();
    }

    deleteUser(user) {
        this._userIndex.delete(user.primaryKey);
        system.delete(user);
    }

    addUser(username) {
        if (this._userIndex.has(username)) {
            throw new Error("A user with that name already exists");
        }
        const user = new User(username);
        system.saveData(user);
        this._userIndex.add(user.primaryKey);
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
            throw new Error('Exercise was invalid');
        }
        system.saveData(exercise);
        this._exerciseIndex.add(exercise.primaryKey);
        system.sendMessage(this, new ExerciseAdded(exercise));
    }

    deleteExercise(primaryKey) {
        const exercise = system.getData(Exercise, primaryKey);
        if(exercise) {
            this._exerciseIndex.delete(exercise.primaryKey);
            system.delete(exercise);
        } else {
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
