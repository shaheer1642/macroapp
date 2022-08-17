import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react'
import './App.css';

import {rendererEvent} from './eventHandler'
import { Typography , Button, Checkbox, TextField} from '@mui/material';

var hotkeys: Array<any> = []
var config: any = {
  keyboardDelay: 10,
  mouseDelay: 6,
  customCommand1ScrollRate: 50
}

interface IMainAppProps {
}
interface IMainAppState {
  update: boolean,
  textFieldKeyboardDelay: number,
  textFieldMouseDelay: number,
  customCommand1ScrollRate: number
}

class MainApp extends React.Component<IMainAppProps,IMainAppState> {
  constructor(props:any) {
    super(props);
    this.state = {
      update: false,
      textFieldKeyboardDelay: config.keyboardDelay,
      textFieldMouseDelay: config.mouseDelay,
      customCommand1ScrollRate: config.customCommand1ScrollRate
    };
  }
  
  componentDidMount() {
    rendererEvent.on('fetchedHotkeys', (data) => {
      console.log('$$$$$$$$$$$rendererEvent fetchHotkeys')
        hotkeys = []
        this.setState({update: !this.state.update}, () => {
            hotkeys = typeof data == 'object' ? data:JSON.parse(data as string)
            this.setState({update: !this.state.update})
        });
    });
    rendererEvent.on('fetchedConfig', (data) => {
      console.log('$$$$$$$$$$$rendererEvent fetchHotkeys')
        config = []
        this.setState({update: !this.state.update}, () => {
            config = typeof data == 'object' ? data:JSON.parse(data as string)
            this.setState({textFieldKeyboardDelay: config.keyboardDelay, textFieldMouseDelay: config.mouseDelay, customCommand1ScrollRate: config.customCommand1ScrollRate})
        });
    });
  }

  componentDidUpdate() {
    console.log('$$$$$$$$$$$ updating component')
  }
  
  render() {
    return (
      <div>
        {this.state.update}
        {hotkeys.map((hotkey,hotkeyIndex) => {
          return (
            <div style={{display: 'flex',alignItems: 'center'}}>
              <p>Hotkey:</p>
              <div style={{width: '10px'}}></div>
              <select style={{height: '30px'}} onChange={(e: any) => {
                  hotkeys[hotkeyIndex].hotkey = e.target.value
                  this.setState({update: !this.state.update})
                }}>
                {Object.keys(keys).map(key => {
                  return (
                    <option value={key} selected={key == hotkey.hotkey ? true:false}>{key}</option>)
                })}
              </select>
              <div style={{width: '10px'}}></div>
              <p>Commands:</p>
              <div style={{width: '10px'}}></div>
              {hotkey.commands.map((command:string,hotkeyCommandsIndex:number) => {
                return (
                  <select style={{height: '30px'}} onChange={(e: any) => {
                    hotkeys[hotkeyIndex].commands[hotkeyCommandsIndex] = e.target.value
                    this.setState({update: !this.state.update})
                  }}>
                    {Object.keys(keys).map(key => {
                      return (
                        <option value={key} selected={key == command ? true:false}>{key}</option>)
                    })}
                  </select>
                )
              })}
              <div style={{width: '10px'}}></div>
              <div style={{display: 'flex',alignItems: 'center'}}>
                <Button variant="contained" color='primary' onClick={() => {
                  hotkeys[hotkeyIndex].commands.push('Select')
                  this.setState({update: !this.state.update})
                }} 
                >+</Button>
                <div style={{width: '10px'}}></div>
                <Button variant="contained" color='warning' onClick={() => {
                  hotkeys[hotkeyIndex].commands.pop()
                  this.setState({update: !this.state.update})
                }}>-</Button>
              </div>
            </div>
          )
        })}
        <div style={{display: 'flex',alignItems: 'center'}}>
          <Checkbox sx={{color: 'white', '&.Mui-checked': {color: 'red'}}} onChange={(e: any) => {
            e.target.checked ? rendererEvent.emit('unregisterHotkeys') : rendererEvent.emit('registerHotkeys')
          }}/>
          <p>Suspend Macros</p>
        </div>
        <div style={{display: 'flex',alignItems: 'center'}}>
          <Button variant="contained" color='primary' onClick={() => {
            hotkeys.push({hotkey: 'Select', commands: ['Select']})
            this.setState({update: !this.state.update})
          }}>+ Create new macro</Button>
          <div style={{width: '10px'}}></div>
          <Button variant="contained" color='warning' onClick={() => {
            hotkeys.pop()
            this.setState({update: !this.state.update})
          }}>- Delete last macro</Button>
        </div>
        <div style={{height: '10px'}}></div>
        <div style={{display: 'flex',alignItems: 'center'}}>
          <Button variant="contained" color='success' onClick={() => {
            rendererEvent.emit('saveHotkeys', hotkeys)
          }}>Save changes</Button>
          <div style={{width: '10px'}}></div>
          <Button variant="contained" color='error' onClick={() => {
            rendererEvent.emit('fetchHotkeys')
          }}>Discard</Button>
        </div>
        <div style={{height: '10px'}}></div>
        <div style={{display: 'flex',alignItems: 'center',color:'white'}}>
          <TextField
            error
            sx={{ input: { color: 'white' } }}
            label="Keypress Delay"
            type="number"
            variant="filled"
            value={this.state.textFieldKeyboardDelay}
            color='error'
            style={{width: '120px'}}
            onChange={(e:any) => {
              this.setState({textFieldKeyboardDelay: e.target.value})
              config.keyboardDelay = e.target.value
              rendererEvent.emit('saveConfig', config)
            }}
          />
          <div style={{width: '10px'}}></div>
          <TextField
            error
            sx={{ input: { color: 'white' }}}
            label="Mousescroll Delay"
            type="number"
            variant="filled"
            value={this.state.textFieldMouseDelay}
            style={{width: '120px'}}
            onChange={(e:any) => {
              this.setState({textFieldMouseDelay: e.target.value})
              config.mouseDelay = e.target.value
              rendererEvent.emit('saveConfig', config)
            }}
          />
        </div>
        <p>Custom Command 1 Setting</p>
        <div style={{display: 'flex',alignItems: 'center',color:'white'}}>
          <TextField
            error
            sx={{ input: { color: 'white' } }}
            label="Scroll Rate"
            type="number"
            variant="filled"
            value={this.state.customCommand1ScrollRate}
            color='error'
            style={{width: '120px'}}
            onChange={(e:any) => {
              this.setState({customCommand1ScrollRate: e.target.value})
              config.customCommand1ScrollRate = e.target.value
              rendererEvent.emit('saveConfig', config)
            }}
          />
        </div>
      </div>
    )
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

const keys = {
  Select: -100,
  customCommand1: -8,
  customCommand2: -7,
  LeftClick: -6,
  RightClick: -5,
  WheelDown: -4,
  WheelUp: -3,
  WheelRight: -2,
  WheelLeft: -1,
  Space: 0,
  Escape: 1,
  Tab: 2,
  LeftAlt: 3,
  LeftControl: 4,
  RightAlt: 5,
  RightControl: 6,
  LeftShift: 7,
  LeftSuper: 8,
  RightShift: 9,
  RightSuper: 10,
  F1: 11,
  F2: 12,
  F3: 13,
  F4: 14,
  F5: 15,
  F6: 16,
  F7: 17,
  F8: 18,
  F9: 19,
  F10: 20,
  F11: 21,
  F12: 22,
  F13: 23,
  F14: 24,
  F15: 25,
  F16: 26,
  F17: 27,
  F18: 28,
  F19: 29,
  F20: 30,
  F21: 31,
  F22: 32,
  F23: 33,
  F24: 34,
  Num0: 35,
  Num1: 36,
  Num2: 37,
  Num3: 38,
  Num4: 39,
  Num5: 40,
  Num6: 41,
  Num7: 42,
  Num8: 43,
  Num9: 44,
  A: 45,
  B: 46,
  C: 47,
  D: 48,
  E: 49,
  F: 50,
  G: 51,
  H: 52,
  I: 53,
  J: 54,
  K: 55,
  L: 56,
  M: 57,
  N: 58,
  O: 59,
  P: 60,
  Q: 61,
  R: 62,
  S: 63,
  T: 64,
  U: 65,
  V: 66,
  W: 67,
  X: 68,
  Y: 69,
  Z: 70,
  Grave: 71,
  Minus: 72,
  Equal: 73,
  Backspace: 74,
  LeftBracket: 75,
  RightBracket: 76,
  Backslash: 77,
  Semicolon: 78,
  Quote: 79,
  Return: 80,
  Comma: 81,
  Period: 82,
  Slash: 83,
  Left: 84,
  Up: 85,
  Right: 86,
  Down: 87,
  Print: 88,
  Pause: 89,
  Insert: 90,
  Delete: 91,
  Home: 92,
  End: 93,
  PageUp: 94,
  PageDown: 95,
  Add: 96,
  Subtract: 97,
  Multiply: 98,
  Divide: 99,
  Decimal: 100,
  Enter: 101,
  NumPad0: 102,
  NumPad1: 103,
  NumPad2: 104,
  NumPad3: 105,
  NumPad4: 106,
  NumPad5: 107,
  NumPad6: 108,
  NumPad7: 109,
  NumPad8: 110,
  NumPad9: 111,
  CapsLock: 112,
  ScrollLock: 113,
  NumLock: 114,
  AudioMute: 115,
  AudioVolDown: 116,
  AudioVolUp: 117,
  AudioPlay: 118,
  AudioStop: 119,
  AudioPause: 120,
  AudioPrev: 121,
  AudioNext: 122,
  AudioRewind: 123,
  AudioForward: 124,
  AudioRepeat: 125,
  AudioRandom: 126
}