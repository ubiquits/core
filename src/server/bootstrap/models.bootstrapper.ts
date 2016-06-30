import { ResolvedReflectiveProvider } from '@angular/core';
import { EntityBootstrapper } from './entity.bootstrapper';
import { ModelStatic } from '../../common/models/model';
import { Table } from 'typeorm/tables';
import { PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm/columns';
import { ModelMetadata } from '../../common/metadata/metadata';

export class ModelBootstrapper extends EntityBootstrapper {

  public getResolvedEntities(): ResolvedReflectiveProvider[] {
    return [];
  }

  public bootstrap(): void {
    this.getFromRegistry('model')
      .forEach((model: ModelStatic<any>) => {
        const meta: ModelMetadata = model.getMetadata();

        this.logger.info(`initializing ${model.name}`, meta);

        Table(meta.storageKey, meta.tableOptions)(model);

        for (const [property, definition] of meta.storedProperties) {
          if (property === meta.identifierKey) {
            PrimaryColumn(definition.columnOptions)(model.prototype, property);
          } else {
            Column(definition.columnOptions)(model.prototype, property);
          }
        }

        if (meta.timestamps) {

          if (meta.timestamps.updated) {
            UpdateDateColumn()(model.prototype, meta.timestamps.updated);
          }

          if (meta.timestamps.created) {
            CreateDateColumn()(model.prototype, meta.timestamps.created);
          }

        }

        //@todo assign table/columns etc

      });
  }

}