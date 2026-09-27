import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { paths } from '../root.ts';
import { IAuthState } from '../../../types/auth';

export const appApi = createApi({
    reducerPath: 'appApi',
    baseQuery: fetchBaseQuery({
        baseUrl: paths.api
    }),
    tagTypes: ['AppData'],
    endpoints: builder => ({
        getAppData: builder.query<IAuthState, void>({
            query: () => 'app',
            providesTags: ['AppData']
        }),
        updateAppTitle: builder.mutation<IAuthState, string>({
            query: title => ({
                url: 'app/title',
                method: 'PUT',
                body: { title }
            }),
            invalidatesTags: ['AppData']
        }),
        deleteAppTitle: builder.mutation<IAuthState, void>({
            query: () => ({
                url: 'app/title',
                method: 'DELETE'
            }),
            invalidatesTags: ['AppData']
        })
    })
});

export const {
    useDeleteAppTitleMutation,
    useGetAppDataQuery,
    useUpdateAppTitleMutation
} = appApi;
