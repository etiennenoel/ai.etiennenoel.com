import {CommandInterface, ConsoleManager, ExitCodeEnum} from '@pristine-ts/cli';
import {DirectoryManager, FileManager} from '@pristine-ts/file';
import {injectable} from 'tsyringe';
import {ServiceDefinitionTagEnum, tag} from '@pristine-ts/common';
import {PathManager} from '@pristine-ts/core';
import {mkdir} from 'node:fs/promises';
import {FileInfoInterface} from '@pristine-ts/file/dist/types/interfaces/file-info.interface';

@injectable()
@tag(ServiceDefinitionTagEnum.Command)
export class PackageSrcChromeDevCommand implements CommandInterface<any> {
  name: string = "package-src:chrome-dev";
  optionsType: any;

  constructor(
    private readonly directoryManager: DirectoryManager,
    private readonly fileManager: FileManager,
    private readonly pathManager: PathManager,
    private readonly consoleManager: ConsoleManager,
    ) {
  }

  async run(args: any): Promise<ExitCodeEnum | number> {
    const projectFolder = this.pathManager.getPathRelativeToCurrentExecutionDirectory("../");

    this.consoleManager.writeLine(`Project folder: ${projectFolder}`);

    // Check if destination folder exists
    const destinationFolder = `${projectFolder}/release/chrome-dev-src`;

    const exists = await this.directoryManager.exists(destinationFolder);

    if (exists) {
      this.consoleManager.writeLine(`Destination folder already exists: ${destinationFolder}, skipping creation.`);
    } else {
      this.consoleManager.writeLine(`Creating destination folder: ${destinationFolder}`);
      await mkdir(destinationFolder, { recursive: true });
    }

    const monitor = (fileInfo: FileInfoInterface) => {
      this.consoleManager.writeLine(`Copying file: ${fileInfo.fullPath}`);
    };

    // Copy src folder and process it
    await this.directoryManager.copy(`${projectFolder}/src`, `${destinationFolder}/src`, {
      recurse: true,
      monitor,
      replaceOperations: [
        {
          search: /\/\/.*@start-remove-in-chrome-dev(\n.*?)*?\/\/.*@end/gi,
          replace: ""
        },
        {
          search: /<!--.*@start-remove-in-chrome-dev.*-->(\n.*?)*?<!--.*@end.*-->/gi,
          replace: ""
        },
      ]
    });

    await this.directoryManager.copy(`${projectFolder}`, destinationFolder, {
      recurse: false,
      match: (file) => {
        const filesToCopy = [
          "angular.json",
          "package.json",
          "package-lock.json",
          "README.md",
          "tsconfig.app.json",
          "tsconfig.json",
          "tsconfig.spec.json"
        ]

        return filesToCopy.includes(file.filename);
      },
      monitor,
    })

    // todo: Move index.chrome-dev.html to index.html

    return ExitCodeEnum.Success;
  }
}
