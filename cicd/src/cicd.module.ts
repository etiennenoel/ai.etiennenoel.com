import {AppModuleInterface} from '@pristine-ts/common';
import {CliModule} from '@pristine-ts/cli';
import {FileModule} from '@pristine-ts/file';
import {PackageSrcChromeDevCommand} from './commands/package-src-chrome-dev.command';
import {CoreModule} from '@pristine-ts/core';

export const AppModule: AppModuleInterface = {
  importModules: [
    CoreModule,
    CliModule,
    FileModule,
  ],
  importServices: [
    PackageSrcChromeDevCommand,
  ],
  keyname: "app.module"

}
