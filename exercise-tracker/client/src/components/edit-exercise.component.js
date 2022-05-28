import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import {useParams} from "react-router-dom"
import "react-datepicker/dist/react-datepicker.css";
import { warp } from 'stackless-js';
import { Exercise, ExerciseTrackerService } from 'exercise-tracker-warp';
import { Navigate } from 'react-router-dom';


class EditExercise extends Component {
    constructor(props) {
        super(props);

        this.onChangeUser = this.onChangeUser.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeDuration = this.onChangeDuration.bind(this);
        this.onChangeDate = this.onChangeDate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            user: null,
            description: '',
            duration: 0,
            date: new Date(),
            users: [],
            service: null,
            redirect: false
        }
    }

    async componentDidMount() {
        try {
            //Get the exercise object by its primary key.
            const exercise = await warp.getDataAsync(Exercise, this.props.id);

            this.setState({
                exercise: exercise,
                user: exercise.user,
                description: exercise.description,
                duration: exercise.duration,
                date: exercise.date,
            });

            //Get a reference to the service since we need it to get the list of users.
            const service = warp.getService(ExerciseTrackerService, 'default');
            this.setState({
                service: service
            });

            //Get the list of users from the service and resolve them.
            const users = await service.getUsersAsync();
            this.setState({
                users: users
            });
        } catch (error) {
            console.error(error);
        }
    }

    onChangeUser(e) {
        this.setState({
            user: this.state.users[e.target.value]
        });
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

        try {
            const exercise = this.state.exercise;
            exercise.user = this.state.user;
            exercise.description = this.state.description;
            exercise.duration = this.state.duration;
            exercise.date = this.state.date;

            //Save the exercise
            await warp.saveDataAsync(exercise);

            this.setState({
                redirect: true
            });
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        if(this.state.redirect) {
            return (<Navigate replace to="/" />);
        }
        return (
            <div>
                <h3>Edit Exercise Log</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Username: </label>
                        <select ref="userInput"
                                required
                                value={this.state.users.findIndex(value => value === this.state.user)}
                                className="form-control"
                                onChange={this.onChangeUser}>
                            {
                                this.state.users.map(function (user, index) {
                                    return <option key={index} value={index}>{user.username} </option>;
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
                        <input type="submit" value="Edit Exercise Log" className="btn btn-primary"/>
                    </div>
                </form>
            </div>
        )
    }
}

function GetEditExerciseWithId() {
    const { id } = useParams();
    return (
        <div>
            <EditExercise id={id} />
        </div>
    );
}

export default GetEditExerciseWithId;