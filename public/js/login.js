/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    console.log(email, password);

    if (res.data.status === 'SUCCESS') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
      console.log(res.data.status);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout'
    });
    if (res.data.status === 'SUCCESS') location.reload(true);

    showAlert('success', 'Log out successful');
  } catch (err) {
    console.log(err.response.data);
    showAlert('error', 'Error logging out! Try again!');
  }
};
