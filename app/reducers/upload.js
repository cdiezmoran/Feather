import {
  ADD_FILE_TO_QUEUE,
  START_UPLOAD,
  FINISH_UPLOAD,
  UPDATE_UPLOAD_PROGRESS,
  AWAIT_SEND_FOR_FILES,
  STOP_WAITING
} from '../actions/upload';

const initialState = {
  isUploading: false,
  progress: 0,
  file: null,
  queue: [],
  waitFiles: [],
  isWaiting: false
};

const downloads = (
  state = initialState,
  { type, file, progress, waitFiles }
) => {
  switch (type) {
    case ADD_FILE_TO_QUEUE:
      return {
        ...state,
        queue: [...state.queue, file]
      };

    case START_UPLOAD:
      return {
        ...state,
        isUploading: true,
        file,
        queue: state.queue.slice(1)
      };

    case UPDATE_UPLOAD_PROGRESS:
      return {
        ...state,
        progress
      };

    case FINISH_UPLOAD:
      return {
        ...state,
        isUploading: false,
        progress: 0,
        file: null
      };

    case AWAIT_SEND_FOR_FILES:
      return {
        ...state,
        isWaiting: true,
        waitFiles
      };

    case STOP_WAITING:
      return {
        ...state,
        isWaiting: false,
        waitFiles: []
      };

    default:
      return state;
  }
};

export default downloads;