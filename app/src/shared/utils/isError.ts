import {AnyAction} from '@reduxjs/toolkit';

const isError = (action: AnyAction) => action.type.endsWith('rejected');

export default isError;
