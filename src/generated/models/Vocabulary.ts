/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RdfClass } from './RdfClass';
import type { User } from './User';

export type Vocabulary = {
    id: number;
    contributors: Array<User>;
    classes: Array<RdfClass>;
    name: string;
    slug: string;
    description?: string;
};
