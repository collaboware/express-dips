/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClassCreationParams } from '../models/ClassCreationParams';
import type { Property } from '../models/Property';
import type { PropertyCreationParams } from '../models/PropertyCreationParams';
import type { RdfClass } from '../models/RdfClass';
import type { SolidProfileShape } from '../models/SolidProfileShape';
import type { Vocabulary } from '../models/Vocabulary';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * @returns Vocabulary Ok
     * @throws ApiError
     */
    public static getVocabs(): CancelablePromise<Array<Vocabulary>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/vocabs',
        });
    }

    /**
     * @param vocab
     * @returns any Ok
     * @throws ApiError
     */
    public static getVocab(
        vocab: string,
    ): CancelablePromise<Vocabulary | null> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/vocabs/{vocab}',
            path: {
                'vocab': vocab,
            },
        });
    }

    /**
     * @param vocab
     * @returns Vocabulary Created
     * @throws ApiError
     */
    public static createVocab(
        vocab: string,
    ): CancelablePromise<Vocabulary> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/vocabs/{vocab}',
            path: {
                'vocab': vocab,
            },
        });
    }

    /**
     * @param vocab
     * @param propertyOrClass
     * @returns void
     * @throws ApiError
     */
    public static getPropertyOrClass(
        vocab: string,
        propertyOrClass: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/vocabs/{vocab}/{propertyOrClass}',
            path: {
                'vocab': vocab,
                'propertyOrClass': propertyOrClass,
            },
        });
    }

    /**
     * @param vocab
     * @param propertyOrClass
     * @param requestBody
     * @returns any Created
     * @throws ApiError
     */
    public static createPropertyOrClass(
        vocab: string,
        propertyOrClass: string,
        requestBody: (PropertyCreationParams | ClassCreationParams),
    ): CancelablePromise<(Property | RdfClass)> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/vocabs/{vocab}/{propertyOrClass}',
            path: {
                'vocab': vocab,
                'propertyOrClass': propertyOrClass,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static profile(): CancelablePromise<(SolidProfileShape | {
        errors: Array<string>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/profile',
        });
    }

    /**
     * @returns boolean Logout successful
     * @throws ApiError
     */
    public static logout(): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/logout',
        });
    }

    /**
     * @returns any Login successful
     * @throws ApiError
     */
    public static login(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/login',
        });
    }

    /**
     * @returns void
     * @throws ApiError
     */
    public static redirectFromSolidIdp(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/redirect-from-solid-idp',
            errors: {
                301: `Successfully redirected from login`,
                500: `Login was not successful.`,
            },
        });
    }

}