import { types } from 'mobx-state-tree';

const UpdateMetadata = types
  .model('UpdateMetadata', {
    appVersion: types.string,
    deploymentKey: types.string,
    description: types.string,
    failedInstall: types.boolean,
    isFirstRun: types.boolean,
    isMandatory: types.boolean,
    isPending: types.boolean,
    label: types.string,
    packageHash: types.string,
    packageSize: types.number,
  });

export default UpdateMetadata;
