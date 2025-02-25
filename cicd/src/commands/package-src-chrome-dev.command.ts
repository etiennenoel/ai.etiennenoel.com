import {CommandInterface, ConsoleManager, ExitCodeEnum} from '@pristine-ts/cli';
import {DirectoryListResultEnum, DirectoryManager, FileManager} from '@pristine-ts/file';
import {injectable} from 'tsyringe';
import {ServiceDefinitionTagEnum, tag} from '@pristine-ts/common';
import {PathManager} from '@pristine-ts/core';
import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
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

    // Move
    await rename(`${destinationFolder}/src/index.chrome-dev.html`, `${destinationFolder}/src/index.html`);

    // Apply licenses
    const license = `/**
 * Copyright ${(new Date()).getFullYear()} Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
`;

    const htmlLicense = `<!--
 Copyright ${(new Date()).getFullYear()} Google LLC
 SPDX-License-Identifier: Apache-2.0
-->
`;

    const files: FileInfoInterface[] = (await this.directoryManager.list(`${destinationFolder}`, {
      recurse: true,
      match: (file) => {
        const fileExtensions = [
          "html",
          "ts",
          "scss",
        ];

        return fileExtensions.includes(file.extension);
      },
      resultType: DirectoryListResultEnum.FileInfoObject,
    })) as FileInfoInterface[];

    // Loop over the files and prepend the license.
    for (const file of files) {
      // Read the file, prepend the license and write it back. Use the NodeJS default fs module.
      const filePath = file.fullPath;
      const fileContent = await readFile(filePath, { encoding: "utf-8" });
      let newContent = fileContent;
      switch (file.extension) {
        case "html":
          newContent = htmlLicense + fileContent;
          break;
        case "ts":
        case "scss":
          newContent = license + fileContent;
          break;
        default:
          break;
      }

      await writeFile(filePath, newContent, { encoding: "utf-8" });
    }

    return ExitCodeEnum.Success;
  }
}
