/// <reference path="util.ts" />

class ServiceContainer {
    private services: StringMap<Service> = {};

    constructor(services: Array<{serviceType: ServiceType, args: any}>) {
        for (let serviceDesc of services) {
            let {serviceType, args} = serviceDesc;
            let name = serviceType.name;
            if (this.services[name] != null) {
                throw new Error(`Service ${name} is already present.`);
            }
            this.services[name] = new serviceType(this, args);
        }

        for (let serviceName of Object.keys(this.services)) {
            let service = this.services[serviceName];
            service.init();
        }
    }

    getService<T extends Service>(serviceType: ServiceType): T {
        let service = this.services[serviceType.name];
        return service as T;
    }
}

interface Service {
    /**
     * Called after all other services have been created. May be called more
     * than once.
     */
    init();
}

interface ServiceType {
    new (services: ServiceContainer, args: any): Service;
    // TODO add readonly when available
    name: string;
}
