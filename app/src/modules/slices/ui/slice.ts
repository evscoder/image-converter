import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

interface UiState {
    isSidebarOpen: boolean;
    activeModal: string | null;
    theme: Theme;
}

const initialState: UiState = {
    isSidebarOpen: false,
    activeModal: null,
    theme: 'light'
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
    }
});

export const {
} = uiSlice.actions;

export default uiSlice.reducer;
