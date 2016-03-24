/// <reference path="services.ts" />
/// <reference path="util.ts" />

class EntityService implements Service {
    constructor(private services: ServiceContainer, args: any) {}
    init() {}

    private static idCounter = 0;

    private entities: NumberMap<Entity> = {};
    private components: StringMap<NumberMap<Component>> = {};

    makeEntity(): Entity {
        let e = new Entity(this, EntityService.idCounter++);
        this.entities[e.id] = e;
        return e;
    }

    addComponent<T>(entity: Entity, componentType: ComponentType) {
        if (this.entities[entity.id] == null) {
            throw new Error(`An entity with ID ${entity.id} does not exist.`);
        }
        let componentCollection = this.components[componentType.name];
        if (componentCollection == null) {
            componentCollection = {};
            this.components[componentType.name] = componentCollection;
        }
        if (componentCollection[entity.id] != null) {
            throw new Error(`Entity ${entity.id} already has a ${componentType.name} component.`);
        }
        componentCollection[entity.id] = new componentType(entity, this.services);
    }

    getComponent<T extends Component>(
            entity: Entity, componentType: ComponentType): T {
        if (this.entities[entity.id] == null) {
            throw new Error(`Entity ${entity.id} not found in entity service.`);
        }
        let componentCollection = this.components[componentType.name];
        if (componentCollection == null) {
            return null;
        }
        return componentCollection[entity.id] as T;
    }

    hasComponent(entity: Entity, componentType: ComponentType): boolean {
        return this.getComponent(entity, componentType) != null;
    }

    getEntitiesWithComponents(componentTypes: Array<ComponentType>): Array<Entity> {
        if (componentTypes.length <= 0) {
            throw new Error("No component types specified.");
        }
        // Get entities that match the first specified component type
        let componentCollection = this.components[componentTypes[0].name];
        if (componentCollection == null) {
            return [];
        }
        let matchingEntities = [];
        entityLoop: for (let entityId in componentCollection) {
            if (!componentCollection.hasOwnProperty(entityId)) {
                continue;
            }
            let entity = this.entities[entityId];
            // check the other component types
            for (let componentType of componentTypes) {
                if (!entity.has(componentType)) {
                    continue entityLoop;
                }
            }
            matchingEntities.push(entity);
        }
        return matchingEntities;
    }
}

interface ComponentType {
    new (entity: Entity, services: ServiceContainer): Component;
    name: string;
}

interface Component {
}

class Entity {
    constructor(private entityService: EntityService, private _id: number) {
    }

    get id(): number {
        return this._id;
    }

    get<T>(componentType: ComponentType): T {
        return this.entityService.getComponent(this, componentType) as T;
    }

    has(componentType: ComponentType): boolean {
        return this.entityService.hasComponent(this, componentType);
    }
}
