/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Property } from './Property';
import type { Vocabulary } from './Vocabulary';

export type RdfClass = {
    id: number;
    vocab: Vocabulary;
    properties: Array<Property>;
    inherits?: RdfClass;
    name: string;
    slug: string;
    description?: string;
};
