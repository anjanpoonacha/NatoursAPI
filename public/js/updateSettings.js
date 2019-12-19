/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
      : 'http://127.0.0.1:8000/api/v1/users/updateMe';

  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'SUCCESS') {
      return showAlert('success', `Successfully updated the ${type}`);
    }

    showAlert('error', 'Error while updating, Try again later!');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
