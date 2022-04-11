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
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DefaultService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns Vocabulary Ok
     * @throws ApiError
     */
    public getVocabs(): CancelablePromise<Array<Vocabulary>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/vocabs',
        });
    }

    /**
     * @param vocab
     * @returns any Ok
     * @throws ApiError
     */
    public getVocab(
        vocab: string,
    ): CancelablePromise<Vocabulary | null> {
        return this.httpRequest.request({
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
    public createVocab(
        vocab: string,
    ): CancelablePromise<Vocabulary> {
        return this.httpRequest.request({
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
    public getPropertyOrClass(
        vocab: string,
        propertyOrClass: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
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
    public createPropertyOrClass(
        vocab: string,
        propertyOrClass: string,
        requestBody: (PropertyCreationParams | ClassCreationParams),
    ): CancelablePromise<(Property | RdfClass)> {
        return this.httpRequest.request({
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
    public profile(): CancelablePromise<(SolidProfileShape | {
        errors: Array<string>;
    })> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/user/profile',
        });
    }

    /**
     * @returns boolean Logout successful
     * @throws ApiError
     */
    public logout(): CancelablePromise<boolean> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/user/logout',
        });
    }

    /**
     * @returns any Login successful
     * @throws ApiError
     */
    public login(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/user/login',
        });
    }

    /**
     * @returns any Successfully redirected from login
     * @throws ApiError
     */
    public redirectFromSolidIdp(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/user/redirect-from-solid-idp',
        });
    }

}