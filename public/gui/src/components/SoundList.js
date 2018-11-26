import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { List } from '@material-ui/core';
import SoundItem from './SoundItem';
import axios from 'axios';

const url = 'https://5e01f26c.ngrok.io'

class SoundList extends Component {
    state = {
        sounds: []
    }
    componentWillMount() {
        axios.get(`${url}/list`)
        .then(res => {
            this.setState({
                sounds: res.data
            })
        })
        .catch(err => {
            console.log(err);
        })
        console.log(this.state.sounds);
    }
    
    extractData = (sound) => {
        let creationDate = sound.substr(0, sound.indexOf(','));
        let duration = sound.substr(sound.indexOf(',') + 1, sound.indexOf('.'));
        duration = parseInt(duration, 10) - parseInt(creationDate, 10);
        return { creationDate: parseInt(creationDate, 10), duration: parseInt(duration, 10) };
    }

    render() {
        const { classes } = this.props;
        const { sounds } = this.state;
        return (
            <div className={classes.soundList}>
                <List>
                    {sounds.map((sound, index) => {
                        let { creationDate, duration } = this.extractData(sound);
                        let date = new Date(creationDate);
                        return <SoundItem key={index} date={date.toString() || 'creation-date'} url={`${url}/data/${sound}`} recTime={duration}/>
                    })}
                </List>
            </div>
        );
    }
}

const styles = theme => ({
    soundList: {
        display: 'flex',
        justifyContent: 'center'
    },
});

SoundList.propTypes = {
    classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(SoundList);
