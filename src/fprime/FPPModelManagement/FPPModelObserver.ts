import { IFPPDataType, IFPPEnumType, IFPPInstance, IFPPTopology, IFPPComponent, IFPPPortType } from './FPPModelManager';
import { OriginModel } from "./FPPModelStore";

let modelChangeHandler = {
    get: function(target: any, property:  any) {
        console.log("MODEL CHANGE TRIGGERED - GET");
        console.log('getting ' + property + ' for: ');
        console.log(target);
        
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

export class ProxyModel extends OriginModel{
    constructor(model: OriginModel) {
        super();
        return new Proxy(
            model, modelChangeHandler
        );
    }
}