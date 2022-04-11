/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SolidProfileShapeType_FoafPerson } from './SolidProfileShapeType_FoafPerson';
import type { SolidProfileShapeType_SchemPerson } from './SolidProfileShapeType_SchemPerson';

export type SolidProfileShape = ({
    knows?: (string | Array<string>);
    publicTypeIndex?: (string | Array<string>);
    privateTypeIndex?: (string | Array<string>);
    account?: string;
    storage?: (string | Array<string>);
    inbox: string;
    img?: string;
    hasPhoto?: string;
    name?: string;
    fn?: string;
    id: string;
} & {
    type: Array<(SolidProfileShapeType_SchemPerson | SolidProfileShapeType_FoafPerson)>;
});
