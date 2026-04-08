import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import { Form, TextArea } from 'semantic-ui-react';
import { Button, Segment, Label } from 'semantic-ui-react'
import { Header } from 'semantic-ui-react';
import AceEditor from "react-ace";
import queryString from 'query-string';
import base64 from 'base-64';

import "ace-builds/src-noconflict/mode-ini";
import "ace-builds/src-noconflict/theme-github";

import './App.css';

const defaultInput = '[{ "value": 1 }, {"value":2}]';
const defaultScript = `# EZS script
[use]
plugin = basics

[JSONParse]
separator = *

[assign]
path = label
value = static value

[debug]
text = before generating an identifier per object

[identify]

[dump]
indent = true
  `;


function isBase64(str) {
    if (str ==='' || str.trim() ===''){ return false; }
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

class App extends Component {
  constructor(props) {
    super(props);
    const { x:x64 } = queryString.parse(window.location.search);
    const x = isBase64(String(x64)) ? base64.decode(x64) : '';
    const { input='', script='' } = x ? JSON.parse(x) : {};
    this.initialInput =  input || defaultInput;
    this.initialScript = script || defaultScript;

    this.state = {
      input: this.initialInput,
      script: this.initialScript,
      output: '',
      log: '',
      cursor: 'pointer',
    };
    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.handleChangeScript = this.handleChangeScript.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSaveURL = this.handleSaveURL.bind(this);
  }

  handleChangeInput(event) {
    const { value } = event.target;
    this.setState({
      input: value,
    });
  }
  handleChangeScript(value) {
    this.setState({
      script: value,
    });
  }

  handleSaveURL(event) {
    event.preventDefault();
    const { input, script } = this.state;
    const x = base64.encode(JSON.stringify({input, script}));
    window.location.search = `?x=${x}`;
  }

  handleClear(event) {
    event.preventDefault();
    this.setState({
      input: '',
      script: '',
      output: '',
      log: '',
    });
  }

  handleSubmit(event) {
    this.setState({
      cursor: 'progress',
    });

    event.preventDefault();
    const { input, script } = this.state;
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, script })
    };
    fetch('/', requestOptions)
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      })
      .then(({ output, log }) => this.setState({ output, log, cursor: 'pointer' }))
      .catch((e) => this.setState({ output: e.message}));
  }

  render() {
    return (
      <div className="App">
        <Header as='h2' icon textAlign='center'>
          <img src="https://inist-cnrs.github.io/ezs/_media/icon.svg" className="App-logo" alt="logo" />
            <Header.Content><a href="https://inist-cnrs.github.io/ezs/#/">EZS</a> Playground</Header.Content>
        </Header>
        <Form onSubmit={this.handleSubmit}>
          <Grid>
            <Grid.Row columns={3}>
              <Grid.Column>
                <Segment padded>
                  <br />
                  <TextArea
                    name='input'
                    placeholder='Input data'
                    height="360px"
                    rows='20'
                    value={this.state.input}
                    onChange={this.handleChangeInput}
                  />
                  <Label
                    attached='top right'
                  >Input</Label>
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment>
                  <AceEditor
                    mode="ini"
                    theme="github"
                    height="360px"
                    defaultValue={this.initialScript}
                    onChange={this.handleChangeScript}
                    name="script-input"
                    enableBasicAutocompletion={false}
                    enableLiveAutocompletion={false}
                    enableSnippets={false}
                  />
                  <Label
                    attached='top right'
                  >Script</Label>
                      </Segment>
                <Button
                  secondary
                  size='medium'
                  floated='left'
                  onClick={this.handleClear}
                >Clear I/O</Button>
                <Button
                  size='medium'
                  floated='left'
                  onClick={this.handleSaveURL}
                >Save as URL</Button>
                <Button
                  primary
                  size='medium'
                  floated='right'
                  onClick={this.handleSubmit}
                  style={{ cursor: this.state.cursor }}
                >Execute</Button>
              </Grid.Column>
              <Grid.Column>
                <Segment padded>
                  <br />
                  <TextArea
                    name='output'
                    placeholder='Transformed data'
                    rows='20'
                    value={this.state.output}
                  />
                  <Label
                    attached='top right'
                  >Output</Label>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Segment padded>
            <pre>
              {this.state.log}
            </pre>
            <Label
              attached='top right'
            >Log</Label>
          </Segment>
        </Form>
      </div>
    );
  }
}
export default App;
