import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import jwtDecode from 'jwt-decode';
import { arrayOf, func, object, node } from 'prop-types';
import { friendRequestShape, userShape } from '../shapes';
import socket, { emit } from '../socketClient';

import notify from '../helpers/notifications';
import useDropzone from '../helpers/useDropzone';

import {
  fetchFilesIfNeeded,
  addFile,
  removeFile,
  removeFileById
} from '../actions/file';
import {
  fetchSentFilesIfNeeded,
  addSentFile,
  removeSentFileById
} from '../actions/sentFile';
import {
  awaitRecipients,
  completeDownload,
  updateProgress
} from '../actions/queue';
import { addLocalDownloads } from '../actions/download';
import { fetchFriendsIfNeeded, addFriend } from '../actions/friend';
import {
  fetchFriendRequestsIfNeeded,
  addFriendRequest
} from '../actions/friendRequest';
import { addUserFromToken } from '../actions/user';
import { addLink, removeLink, removeLinkById } from '../actions/link';

import NavBar from '../components/NavBar';
import PopUpContainer from './PopUpContainer';
import DropOverlay from '../components/DropOverlay';

const mapStateToProps = ({ user, friendRequest: { friendRequests } }) => ({
  user,
  friendRequests
});

const mapDispatchToProps = dispatch => ({
  fetchFiles: () => dispatch(fetchFilesIfNeeded()),
  fetchFriends: () => dispatch(fetchFriendsIfNeeded()),
  fetchFriendRequests: () => dispatch(fetchFriendRequestsIfNeeded()),
  fetchSentFiles: () => dispatch(fetchSentFilesIfNeeded()),
  finishDownload: (fileID, filename, savePath) =>
    dispatch(completeDownload(fileID, filename, savePath)),
  updateDownloadProgress: (fileID, progress) =>
    dispatch(updateProgress(fileID, progress)),
  dAddFile: file => dispatch(addFile(file)),
  dRemoveFile: index => dispatch(removeFile(index)),
  addReceivedFriendRequest: friendRequest =>
    dispatch(addFriendRequest(friendRequest)),
  waitForRecipients: files => dispatch(awaitRecipients(files)),
  addNewFriend: friend => dispatch(addFriend(friend)),
  addNewLink: link => dispatch(addLink(link)),
  updateUser: (token, cb = null) => dispatch(addUserFromToken(token, cb)),
  addStorageFiles: () => dispatch(addLocalDownloads()),
  deleteLink: index => dispatch(removeLink(index)),
  receiveSentFile: file => dispatch(addSentFile(file)),
  deleteSentFile: id => dispatch(removeSentFileById(id)),
  deleteFileById: id => dispatch(removeFileById(id)),
  deleteLinkById: id => dispatch(removeLinkById(id))
});

const App = ({
  addNewFriend,
  addNewLink,
  addReceivedFriendRequest,
  children,
  dAddFile,
  finishDownload,
  dRemoveFile,
  updateDownloadProgress,
  fetchFiles,
  fetchFriends,
  fetchFriendRequests,
  fetchSentFiles,
  friendRequests,
  history,
  location: { pathname },
  updateUser,
  user,
  waitForRecipients,
  addStorageFiles,
  deleteLink,
  deleteSentFile,
  receiveSentFile,
  deleteFileById,
  deleteLinkById
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const isDragging = useDropzone(waitForRecipients);

  // component did mount equivalent (runs once)
  useEffect(() => {
    const token = localStorage.getItem('tempoToken');
    const localConfig = localStorage.getItem('localConfig');

    if (!localConfig)
      localStorage.setItem(
        'localConfig',
        JSON.stringify({
          notifyUpload: true,
          notifyRecieve: true,
          notifyDownload: true
        })
      );

    if (
      !Object.prototype.hasOwnProperty.call(user, 'id') &&
      !token &&
      pathname !== '/auth'
    ) {
      history.push('/auth');
    }

    if (Object.prototype.hasOwnProperty.call(user, 'id') || token) {
      const userId = Object.prototype.hasOwnProperty.call(user, 'id')
        ? user.id
        : jwtDecode(token).id;
      emit('userConnection', userId);
      updateUser(token, () => fetchData());
    }

    setupListeners();
  }, []);

  const fetchData = () => {
    fetchFiles()
      .then(() => addStorageFiles())
      .catch();
    fetchSentFiles();
    fetchFriends();
    fetchFriendRequests();
  };

  const setupListeners = () => {
    const localConfig = JSON.parse(localStorage.getItem('localConfig'));

    ipcRenderer.on('download-progress', handleDownloadProgress);
    ipcRenderer.on('download-finish', handleDownloadFinish);
    ipcRenderer.on('upload-from-tray', handleTrayUpload);
    ipcRenderer.on('updateReady', () => setUpdateAvailable(true));
    socket.on('recieveFile', file => {
      dAddFile(file);

      if (localConfig.notifyReceived) {
        notify({
          title: 'File Recieved',
          body: `You can now download ${file.name} on this device.`
        });
      }
    });
    socket.on('removeFile', index => dRemoveFile(index));
    socket.on('removeFileById', id => deleteFileById(id));
    socket.on('receiveSentFile', file => receiveSentFile(file));
    socket.on('removeSentFile', id => deleteSentFile(id));
    socket.on('newFriend', friend => addNewFriend(friend));
    socket.on('newLink', link => addNewLink(link));
    socket.on('removeLink', index => deleteLink(index));
    socket.on('removeLinkById', id => deleteLinkById(id));
    socket.on('receiveFriendRequest', friendRequest => {
      addReceivedFriendRequest(friendRequest);

      notify({
        title: `${friendRequest.from.username} sent a friend request!`,
        body: 'You can see this request on your friends page.'
      });
    });
    socket.on('updateUser', token => updateUser(token));
  };

  const handleTrayUpload = (e, files) => waitForRecipients(files);

  const handleDownloadProgress = (e, { progress, fileId }) =>
    updateDownloadProgress(fileId, progress);

  const handleDownloadFinish = (e, { fileId, filename, savePath }) =>
    finishDownload(fileId, filename, savePath);

  return (
    <>
      {pathname !== '/settings' && pathname !== '/auth' ? (
        <NavBar
          pathname={pathname}
          history={history}
          requestIndicator={friendRequests.length > 0}
          updateAvailable={updateAvailable}
        />
      ) : null}
      {children}
      <PopUpContainer fetchData={fetchData} />
      <DropOverlay visible={isDragging} />
    </>
  );
};

App.propTypes = {
  children: node.isRequired,
  location: object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: object.isRequired, // eslint-disable-line react/forbid-prop-types
  fetchFiles: func.isRequired,
  fetchSentFiles: func.isRequired,
  finishDownload: func.isRequired,
  updateDownloadProgress: func.isRequired,
  dAddFile: func.isRequired,
  dRemoveFile: func.isRequired,
  receiveSentFile: func.isRequired,
  deleteSentFile: func.isRequired,
  fetchFriends: func.isRequired,
  updateUser: func.isRequired,
  fetchFriendRequests: func.isRequired,
  addReceivedFriendRequest: func.isRequired,
  waitForRecipients: func.isRequired,
  addNewFriend: func.isRequired,
  addNewLink: func.isRequired,
  deleteLink: func.isRequired,
  friendRequests: arrayOf(friendRequestShape),
  addStorageFiles: func.isRequired,
  deleteFileById: func.isRequired,
  deleteLinkById: func.isRequired,
  user: userShape
};

App.defaultProps = {
  friendRequests: [],
  user: {}
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
