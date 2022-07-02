import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import { Navigate } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import {warp} from "warp-client";
import {Exercise, ExerciseTrackerService} from "exercise-tracker-warp";

export default class CreateExercise extends Component {
    constructor(props) {
        super(props);

        this.onChangeUser = this.onChangeUser.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeDuration = this.onChangeDuration.bind(this);
        this.onChangeDate = this.onChangeDate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            service: null,
            user: null,
            description: '',
            duration: 0,
            date: new Date(),
            users: [],
            redirect: false
        }
    }

    async componentDidMount() {
        try {
            //Get a reference to the service
            const service = warp.getService(ExerciseTrackerService, "default");

            this.setState({
                service: service
            });

            //Get the users list from the service
            const users = await service.getUsersAsync();

            if(users) {
                this.setState({
                    users: users,
                    user: users[0]
                });
            } else {
                console.error("No users found");
            }
        } catch (error) {
            console.error(error);
        }
    }

    onChangeUser(e) {
        this.setState({
            user:  this.state.users[e.target.value]
        })
    }

    onChangeDescription(e) {
        this.setState({
            description: e.target.value
        })
    }

    onChangeDuration(e) {
        this.setState({
            duration: Number(e.target.value)
        })
    }

    onChangeDate(date) {
        this.setState({
            date: date
        })
    }

    async onSubmit(e) {
        e.preventDefault();

        try
        {
            //Create the exercise object locally (could be done in the service too, if you had a need).
            const exercise = new Exercise(this.state.user, this.state.description, this.state.duration, this.state.date);

            //Pass the exercise to the service so it'll add it to the index and save it to the database.
            await this.state.service.addExerciseAsync(exercise);

            console.log(`Exercise ${exercise.primaryKey} added`);

            this.setState({
                redirect: true
            });
        }
        catch(error) {
            console.error(error);
        }
    }

    render() {
        if(this.state.redirect) {
            return (<Navigate replace to="/" />);
        }

        return (
            <div>
                <h3>Create New Exercise Log</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Username: </label>
                        <select ref="userInput"
                                required
                                className="form-control"
                                onChange={this.onChangeUser}>
                            {
                                this.state.users.map(function (user, index) {
                                    return <option key={index} value={index}>{user.username}</option>;
                                })
                            }
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description: </label>
                        <input type="text"
                               required
                               className="form-control"
                               value={this.state.description}
                               onChange={this.onChangeDescription}
                        />
                    </div>
                    <div className="form-group">
                        <label>Duration (in minutes): </label>
                        <input
                            type="text"
                            className="form-control"
                            value={this.state.duration}
                            onChange={this.onChangeDuration}
                        />
                    </div>
                    <div className="form-group">
                        <label>Date: </label>
                        <div>
                            <DatePicker
                                selected={this.state.date}
                                onChange={this.onChangeDate}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <input type="submit" value="Create Exercise Log" className="btn btn-primary"/>
                    </div>
                </form>
            </div>
        )
    }
}