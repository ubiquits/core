/**
 * @module server
 */
/** End Typedoc Module Declaration */
import { EntityBootstrapper } from './entity.bootstrapper';
import { AbstractController } from '../controllers/abstract.controller';
import { RegistryEntityStatic } from '../../common/registry/entityRegistry';
import { ControllerMetadata } from '../../common/metadata/metadata';

/**
 * Provides bootstrapping of the @[[Controller]] entities
 */
export class ControllerBootstrapper extends EntityBootstrapper {

  /**
   * Returns all controllers registered to the [[EntityRegistry]]
   */
  public getInjectableEntities(): RegistryEntityStatic<ControllerMetadata>[] {
    return this.getEntitiesFromRegistry('controller');
  }

  public bootstrap(): void {
    this.entities.forEach((resolvedController: RegistryEntityStatic<ControllerMetadata>) => {

      let controller = this.getInstance<AbstractController>(resolvedController);

      controller.registerInjector(this.injector)
        .registerRoutes();

    });
  }

}
