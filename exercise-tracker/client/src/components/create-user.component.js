import React, {Component} from 'react';
import { Navigate } from 'react-router-dom';
import { warp } from 'stacklessjs';
import { ExerciseTrackerService } from 'exercise-tracker-warp';

export default class CreateUser extends Component {
    constructor(props) {
        super(props);

        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            service: null,
            username: '',
            redirect: false
        }
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        })
    }

    async componentDidMount() {
        try
        {
            //Get a reference to the exercise tracker service
            const service = warp.getService(ExerciseTrackerService, "default");

            this.setState({
                service: service
            });
        }
        catch(error){
            console.error(error);
        }
    }

    async onSubmit(e) {
        e.preventDefault();

        try
        {
            await this.state.service.addUserAsync(this.state.username);

            console.log(`User ${this.state.username} added`);

            this.setState({
                username: '',
                redirect: true
            });
        }
        catch(error)
        {
            console.error(error);
        }
    }

    render() {
        if(this.state.redirect) {
            return (<Navigate replace to="/create"/>);
        }

        return (
            <div>
                <h3>Create New User</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Username: </label>
                        <input type="text"
                               required
                               className="form-control"
                               value={this.state.username}
                               onChange={this.onChangeUsername}
                        />
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Create User" className="btn btn-primary"/>
                    </div>
                </form>
            </div>
        )
    }
}