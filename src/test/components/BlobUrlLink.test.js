/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow
import * as React from 'react';
import { render } from 'react-testing-library';
import { BlobUrlLink } from '../../components/shared/BlobUrlLink';
import { ensureExists } from '../../utils/flow';

describe('shared/BlobUrlLink', () => {
  beforeEach(async () => {
    // jsdom does not have URL.createObjectURL.
    // See https://github.com/jsdom/jsdom/issues/1721
    let i = 1;
    (URL: any).createObjectURL = jest.fn(() => `mockCreateObjectUrl${i++}`);
    (URL: any).revokeObjectURL = jest.fn(() => {});
  });

  afterAll(async () => {
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  it('injects a blob url into a link', () => {
    const blob = new Blob(['content']);
    const result = render(
      <BlobUrlLink className="myClassName" blob={blob}>
        This is the text
      </BlobUrlLink>
    );
    const a = ensureExists(
      result.container.querySelector('a'),
      'Unable to find an <a>'
    );
    expect(a.getAttribute('href')).toEqual('mockCreateObjectUrl1');
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(0);
    expect(a.innerHTML).toBe('This is the text');
  });

  it('revokes the object url', () => {
    const blob = new Blob(['content']);
    const result = render(
      <BlobUrlLink className="myClassName" blob={blob}>
        This is the text
      </BlobUrlLink>
    );
    result.unmount();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mockCreateObjectUrl1');
  });

  it('can update with a new blob the object url', () => {
    const blob1 = new Blob(['content']);
    const blob2 = new Blob(['content']);
    const result = render(
      <BlobUrlLink className="myClassName" blob={blob1}>
        This is the text
      </BlobUrlLink>
    );
    const a = ensureExists(
      result.container.querySelector('a'),
      'Unable to find an <a>'
    );

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(0);
    expect(a.getAttribute('href')).toEqual('mockCreateObjectUrl1');

    result.rerender(
      <BlobUrlLink className="myClassName" blob={blob2}>
        This is the text
      </BlobUrlLink>
    );

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob2);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mockCreateObjectUrl1');
    expect(a.getAttribute('href')).toEqual('mockCreateObjectUrl2');

    URL.createObjectURL.mockReset();
    result.unmount();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mockCreateObjectUrl1');
  });
});
