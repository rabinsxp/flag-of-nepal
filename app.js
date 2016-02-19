import React, { Component } from 'react';
import 'whatwg-fetch';
import * as util from './util.js';
import 'babel/polyfill';

class App extends Component {

  constructor(...args) {
    super(...args);

    this.state = {};
    this.state.error = false;
    this.state.userImageUrl = null;
    this.state.loggedIn = false;
    this.state.userDetails = {};

    this.generateImage = this.generateImage.bind(this);
    this.onError = this.onError.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.postToFacebook = this.postToFacebook.bind(this);
    this.requestPublishPermissions = this.requestPublishPermissions.bind(this);
  }

  generateImage() {
    this.state.userImageUrl = null;
    this.state.error = false;
    const profileImageUrl = encodeURIComponent(`https://graph.facebook.com/${this.state.userDetails.userID}/picture?width=800&height=800`);
    util.mergeImages(`/proxy-image-app-np?url=${profileImageUrl}&rand=${Math.random()}`, 'flag.png')
      .then((image) => {
        this.state.userImageUrl = image;
        this.setState(this.state);
      })
      .catch(this.onError);
  }

  componentWillMount() {
    FB.init({
      appId      : '519129691585992',
      xfbml      : true,
      version    : 'v2.4'
    });
  }

  onError(err) {
    console.log(err);
    this.state.error = err.message;
    this.setState(this.state);
  }

  postToFacebook() {
    this.requestPublishPermissions()
    .then(() => {
      util.postToFacebook({
        accessToken: this.state.userDetails.accessToken,
        image: util.dataURItoBlob(this.state.userImageUrl),
        message: 'Nepali Flag Profile Picture: Make your profile picture with Flag of Nepal from http://apps.rabinsxp.com/nepali-flag',
        userID: this.state.userDetails.userID
      }).then(() => {
        alert('Posted Successfully');
      }).catch(this.onError);
    })
    .catch(this.onError)
  }

  requestPublishPermissions() {
    return new Promise((resolve, reject) => {
      FB.login((response) => {
        if (response.authResponse) {
          this.state.userDetails = {
            userID : response.authResponse.userID,
            accessToken: response.authResponse.accessToken
          };
          resolve();
        } else {
          reject(new Error('Failed to request permission'));
        }
      }, { scope: 'publish_actions'});
    });
  }

  onLogin(details) {
    this.state.userDetails = details;
    this.state.loggedIn = true;
    this.generateImage();
    this.setState(this.state);
  }

  render() {
    const userImageUrl = this.state.userImageUrl;
    const error = this.state.error;
    const loggedIn = this.state.loggedIn;
    const defaultImageUrl = 'default.jpg';
    let imageBoxContent = null;

    if(error) {
      imageBoxContent = (
        <div>
          <div className="alert alert-danger">{error.length ? error : 'An error occurred.'}</div>
          <Login onLogin={this.onLogin}/>
        </div>
      );
    } else if(!loggedIn){
      imageBoxContent = <Login onLogin={this.onLogin}/>;
    }  else if(loggedIn && !userImageUrl){
      imageBoxContent = (
        <div className="loading">Please Wait</div>
      );
    } else {
      imageBoxContent = (
        <div className="post">
          <a className="btn btn-default" href={userImageUrl} download="profile-nepal.jpg">Download</a>
        </div>
      );
    }

    return (
      <div className="container">
        <ImageBox src={userImageUrl || defaultImageUrl}>{imageBoxContent}</ImageBox>
        <div className="social">
          <div className="fb-like" data-href="http://apps.rabinsxp.com/nepali-flag/" data-layout="standard" data-action="like" data-show-faces="false" data-share="true"></div>
        </div>
        <div className="alert alert-info footer-info">
          <ul>
            <li>Made by <a href="http://twitter.com/rabinsxp"><i className="fa fa-twitter"></i> @rabinsxp</a>,  <a href="https://facebook.com/rabinsxp"><i className="fa fa-facebook"></i> Rabins Lamichhane</a></li>
            <li>Tested only in latest version of Chrome and Firefox. </li>
            <li>Know how Digital Nepal started <a href="http://www.rabinsxp.com/2015/10/digital-nepal-revolution-of-information.html" target="_blank">Digital Nepal : Revolution of Information and Technology</a> </li>
          </ul>
        </div>
      </div>
    )
  }
}

class ImageBox extends Component {
  render() {
    return (
      <div className="ImageBox">
        <div className="ImageBox__image">
          <img src={this.props.src} width="500" height="500"/>
        </div>
        <div className="ImageBox__inner">{this.props.children}</div>
      </div>
    )
  }
}

class Login extends Component {

  login() {
    FB.login((response) => {
      if (response.authResponse) {
        this.props.onLogin({
          userID : response.authResponse.userID,
          accessToken: response.authResponse.accessToken
        });
      } else {
        console.log('Not Logged In');
      }
    });
  }

  checkLogin() {
    FB.getLoginStatus( (response)=> {
      if(response.status === 'connected') {
        this.props.onLogin({
          userID : response.authResponse.userID,
          accessToken: response.authResponse.accessToken
        });
      } else {
        this.login();
      }
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.checkLogin.bind(this)} className="btn btn-default">Create from Facebook</button>
        {' '}
        <a href="http://images.rabinsxp.com" className="btn btn-default">Upload</a>
      </div>
    )
  }
}

React.render(<App />, document.getElementById('app'));
