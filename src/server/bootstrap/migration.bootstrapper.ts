import { ResolvedReflectiveProvider } from '@angular/core';
import { EntityBootstrapper } from './entity.bootstrapper';
import { BaseMigration } from '../migrations/index';

export class MigrationBootstrapper extends EntityBootstrapper {

  public getResolvedEntities(): ResolvedReflectiveProvider[] {
    return this.getResolvedFromRegistry('migration');
  }

  public bootstrap(): Promise<void> {

    this.logger.debug(`Running [${this.resolvedEntityProviders.length}] migrations`);

    const allMigrationPromises = this.resolvedEntityProviders.map((resolvedControllerProvider: ResolvedReflectiveProvider) => {

      this.logger.info(`migrating ${resolvedControllerProvider.key.displayName}`);
      return (this.injector.instantiateResolved(resolvedControllerProvider) as BaseMigration).migrate();

    }, []);

    return Promise.all(allMigrationPromises);
  }

}
