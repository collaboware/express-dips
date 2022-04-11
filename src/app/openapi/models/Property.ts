/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RdfClass } from './RdfClass';

export type Property = {
    id: number;
    domain: RdfClass;
    name: string;
    slug: string;
    description?: string;
};
