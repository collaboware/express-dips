/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserSession } from './UserSession';

export type User = {
    id: number;
    webId: string;
    name?: string;
    sessions: Array<UserSession>;
};
