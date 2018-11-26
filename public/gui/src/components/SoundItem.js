import React, { Component } from 'react';
import { ListItem, ListItemIcon, ListItemText, IconButton, Divider } from '@material-ui/core';
import Sound from 'react-sound';
import PlayArroIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';

class SoundItem extends Component {
    state = {
        playing: false,
        playStatus: Sound.status.STOPPED,
        endTime: (this.props.recTime / 60) / 60,
    }
    playSound = () => {
        if (this.state.playStatus === Sound.status.PLAYING) {
            this.setState({
                playing: false,
                playStatus: Sound.status.STOPPED
            });
        } else {
            this.setState({
                playing: true,
                playStatus: Sound.status.PLAYING
            });
        }
        
    }
    onFinishHandle = () => {
        this.setState({
            playing: false,
            playStatus: Sound.status.STOPPED,
        })
    }
    render() {
        const { url, date } = this.props;
        const { endTime, playStatus } = this.state;
        return (
            <div>
                <ListItem>
                    <ListItemIcon>
                    {
                        !this.state.playing ? (
                        <IconButton title="play" onClick={() => this.playSound()}>
                            <PlayArroIcon />
                        </IconButton> 
                        ) : (
                        <IconButton title="pause" onClick={() => this.playSound()}>
                            <PauseIcon />
                        </IconButton> 
                        )
                    }
                    </ListItemIcon>
                    <ListItemText primary={date} />
                    <ListItemText primary={`${endTime}`.substr(0, 3)} />
                </ListItem>
                <Divider />
                <Sound 
                    url={url} 
                    playStatus={playStatus}
                    onFinishedPlaying={this.onFinishHandle}
                />
            </div>
        );
    }
}

export default SoundItem;
