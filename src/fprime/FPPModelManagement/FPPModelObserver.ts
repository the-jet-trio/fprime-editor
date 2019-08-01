import { IFPPDataType, IFPPEnumType, IFPPInstance, IFPPTopology, IFPPComponent, IFPPPortType } from './FPPModelManager';
import { originModel } from "./FPPModelStore";

let arrayChangeHandler = {
    get: function(target: any, property:  any) {
        if (typeof target[property] === "function") {
            if (property === 'push') {
                console.log("MODEL CHANGE TRIGGERED - GET");
                console.log('getting ' + property + ' for ' + target);
            }
        }
      // property is index in this case
      return target[property];
    },
    set: function(target: any, property:  any, value: any) {
        console.log("MODEL CHANGE TRIGGERED - SET");
        console.log('setting ' + property + ' for ' + target + ' with value ' + value );
        target[property] = value;
        // you have to return true to accept the changes
        return true;
    }
};

class ProxyModel {
    public datatypes: IFPPDataType[];
    public enumtypes: IFPPEnumType[];
    public instances: IFPPInstance[];
    public topologies: IFPPTopology[];
    public components: IFPPComponent[];
    public porttypes: IFPPPortType[];

    constructor() {
        this.datatypes = new Proxy(originModel.datatypes, arrayChangeHandler);
        this.enumtypes = new Proxy(originModel.enumtypes, arrayChangeHandler);
        this.instances = new Proxy(originModel.instances, arrayChangeHandler);
        this.topologies = new Proxy(originModel.topologies, arrayChangeHandler);
        this.components = new Proxy(originModel.components, arrayChangeHandler);
        this.porttypes = new Proxy(originModel.porttypes, arrayChangeHandler);
    }
}

export let proxyModel = new ProxyModel();