import { IFPPDataType, IFPPEnumType, IFPPInstance, IFPPTopology, IFPPComponent, IFPPPortType } from './FPPModelManager';

export class OriginModel {
    public datatypes: IFPPDataType[];
    public enumtypes: IFPPEnumType[];
    public instances: IFPPInstance[];
    public topologies: IFPPTopology[];
    public components: IFPPComponent[];
    public porttypes: IFPPPortType[];

    constructor() {
        this.datatypes = [];
        this.enumtypes = [];
        this.instances = [];
        this.topologies = [];
        this.components = [];
        this.porttypes= [];
    }
}