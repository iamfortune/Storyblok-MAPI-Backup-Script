const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const axios = require('axios');
const fs = require('fs');
const sinon = require('sinon');
const { backupContent } = require('./backup'); 

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Backup Content Script', () => {
  let axiosGetStub;
  let fsExistsSyncStub;
  let fsMkdirSyncStub;
  let fsWriteFileSyncStub;
  let consoleLogStub;
  let consoleErrorStub;

  beforeEach(() => {
    axiosGetStub = sinon.stub(axios, 'get');
    fsExistsSyncStub = sinon.stub(fs, 'existsSync');
    fsMkdirSyncStub = sinon.stub(fs, 'mkdirSync');
    fsWriteFileSyncStub = sinon.stub(fs, 'writeFileSync');
    consoleLogStub = sinon.stub(console, 'log');
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should backup content successfully', async () => {
    const expectedStories = [
      { id: 1, full_slug: 'story-1' },
      { id: 2, full_slug: 'story-2' },
    ];
    const response1 = {
      data: {
        stories: expectedStories.slice(0, 1),
      },
    };
    const response2 = {
      data: {
        stories: expectedStories.slice(1),
      },
    };

    axiosGetStub
      .onFirstCall()
      .resolves(response1)
      .onSecondCall()
      .resolves(response2);

    fsExistsSyncStub.returns(false);
    fsMkdirSyncStub.returns();
    fsWriteFileSyncStub.returns();

    await backupContent();

    expect(axiosGetStub.callCount).to.equal(2);
    expect(fsWriteFileSyncStub.callCount).to.equal(expectedStories.length);
    expect(consoleLogStub.callCount).to.equal(expectedStories.length + 1);
    expect(consoleErrorStub.callCount).to.equal(0);
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Some error occurred';
    axiosGetStub.rejects(new Error(errorMessage));

    fsExistsSyncStub.returns(false);
    fsMkdirSyncStub.returns();
    fsWriteFileSyncStub.returns();

    await backupContent();

    expect(axiosGetStub.callCount).to.equal(1);
    expect(fsWriteFileSyncStub.callCount).to.equal(0);
    expect(consoleLogStub.callCount).to.equal(0);
    expect(consoleErrorStub.callCount).to.equal(1);
    expect(consoleErrorStub.firstCall.args[0]).to.equal(
      'Error occurred while fetching stories:'
    );
    expect(consoleErrorStub.firstCall.args[1].message).to.equal(errorMessage);

  });
});
