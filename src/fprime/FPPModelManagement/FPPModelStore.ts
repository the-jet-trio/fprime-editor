import { IFPPDataType, IFPPEnumType, IFPPInstance, IFPPTopology, IFPPComponent, IFPPPortType } from './FPPModelManager';

class OriginModel {
    public datatypes: IFPPDataType[] = [];
    public enumtypes: IFPPEnumType[] = [];
    public instances: IFPPInstance[] = [];
    public topologies: IFPPTopology[] = [];
    public components: IFPPComponent[] = [];
    public porttypes: IFPPPortType[] = [];
}

export let originModel = new OriginModel();