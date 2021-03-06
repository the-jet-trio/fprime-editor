import IConfig from "../Common/Config";
import DataImporter, {IOutput} from "../DataImport/DataImporter";
import fs from "fs";
import _ from "lodash";
import * as path from "path";
const getDirName = require("path").dirname;
import fprime from "fprime";
/**
 *
 */
export enum ViewType {
    Function = "Function View",
    InstanceCentric = "InstanceCentric View",
    Component = "Component View",
    PortType = "PortType View",
    DataType = "DataType View",
}

/**
 * A data type defined
 */
export interface IFPPDataType {
    namespace: string;
    name: string;
}

/**
 * An enum type defined
 */
export interface IFPPEnumType {
    namespace: string;
    name: string;
    arg: { [key: string]: number };
}

/**
 * A port type defined
 */
export interface IFPPPortType {
    name: string;
    namespace: string;
    arg: { [key: string]: { value: string, pass_by: string } };
}

/**
 * A port created in a component
 */
export interface IFPPPort {
    name: string;
    properties: { [key: string]: any };
}

/**
 * A component type
 */
export interface IFPPComponent {
    name: string;
    namespace: string;
    ports: IFPPPort[];
    kind: string;
}

/**
 * A component instance
 */
export interface IFPPInstance {
    name: string;
    base_id: string;
    ports: { [p: string]: IFPPPort };
    properties: { [p: string]: string };
    // Modified by Minghui Tang 7/28/2019
    // used for filterPorts feature
    used_ports: { [p: string]: IFPPPort };
}

/**
 * A connection in the topology
 */
export interface IFPPConnection {
    from: { inst: IFPPInstance, port?: IFPPPort };
    to?: { inst: IFPPInstance, port: IFPPPort };
}

/**
 * A topology information in the functional view
 */
export interface IFPPTopology {
    name: string;
    connections: IFPPConnection[];
}

/**
 * The whole FPP model
 */
export interface IFPPModel {
    instances: IFPPInstance[];
    connections: IFPPConnection[];
    components: IFPPComponent[];
}

/**
 * Element stored in undo/redo stack
 */
interface IStackEle {
    text: { [fileName: string]: string };
    datatypes: IFPPDataType[];
    enumtypes: IFPPEnumType[];
    instances: IFPPInstance[];
    topologies: IFPPTopology[];
    components: IFPPComponent[];
    porttypes: IFPPPortType[];
}

/**
 *
 */
export default class FPPModelManager {
    private text: { [fileName: string]: string } = {};
    private dataImporter: DataImporter = new DataImporter();
    private datatypes: IFPPDataType[] = [];
    private enumtypes: IFPPEnumType[] = [];
    private instances: IFPPInstance[] = [];
    private topologies: IFPPTopology[] = [];
    private components: IFPPComponent[] = [];
    private porttypes: IFPPPortType[] = [];
    private keywords: string[] = ["base_id", "name"];
    private defaultNamespace: string = "Ref";
    private undo_stack: IStackEle[] = [];
    private redo_stack: IStackEle[] = [];
    private MAX_undo_redo: number = 10; // Maximum number of undos/redos

    public constructor() {
        this.reset();
    }
    /**
     *
     */
    public async loadModel(
        config: IConfig, output?: IOutput): Promise<{ [k: string]: string[] }> {
        // push the current model to undo_stack
        this.push_curr_state_to_stack(this.undo_stack);
        // Reset all the model object lists
        this.reset();

        // Invoke the compiler
        var data = await this.dataImporter.invokeCompiler(config, output);

        // Load the model from xml object and return the view list
        if (data == null || data.length === 0) {
            throw new Error("fail to parse model data, model is null!");
        }

        data.forEach((i: any) => {
            this.datatypes = this.datatypes.concat(this.generateDataType(
                i.namespace.data_type,
            ));
        });

        data.forEach((i: any) => {
            this.enumtypes = this.enumtypes.concat(this.generateEnumType(
                i.namespace.enum,
            ));
        });

        data.forEach((i: any) => {
            this.porttypes = this.porttypes.concat(this.generatePortType(
                i.namespace.port_type,
            ));
        });

        data.forEach((i: any) => {
            this.components = this.components.concat(this.generateComponents(
                i.namespace.component,
            ));
        });

        data.forEach((i: any) => {
            if (i.namespace.system == null || i.namespace.system.length === 0) {
                return;
            }

            this.instances = this.instances.concat(this.generateInstances(
                i.namespace.$.name,
                i.namespace.system[0].instance,
            ));
        });

        data.forEach((i: any) => {
            if (i.namespace.system == null || i.namespace.system.length === 0) {
                return;
            }

            this.topologies = this.topologies.concat(this.generateTopologies(
                i.namespace.$.name,
                i.namespace.system[0].topology,
            ));
        });

        // Return the view list of the model
        var viewlist = this.generateViewList();

        // Add output information
        if (output) {
            output.appendOutput("Generate view list...");
        }

        // Generate text
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        // Notify the InfoPanel that it's ready to get the port and comp info.
        fprime.viewManager.portInfo();
        fprime.viewManager.compInfo();
        return viewlist;
    }

    /**
     * generateViewList
     * Return the view list of the model
     */
    public generateViewList(): { [k: string]: string[] } {
        var viewlist: { [k: string]: string[] } = {
            topologies: [],
            instances: [],
            components: [],
            porttypes: [],
            datatypes: [],
        };

        this.datatypes.forEach((e: IFPPDataType) => {
            viewlist.datatypes.push(e.namespace + "." + e.name);
        });

        this.enumtypes.forEach((e: IFPPDataType) => {
            viewlist.datatypes.push(e.namespace + "." + e.name);
        });

        this.porttypes.forEach((e: IFPPPortType) => {
            viewlist.porttypes.push(e.namespace + "." + e.name);
        });

        this.topologies.forEach((e: IFPPTopology) => {
            viewlist.topologies.push(e.name);
        });

        this.instances.forEach((e: IFPPInstance) => {
            viewlist.instances.push(e.name);
        });

        this.components.forEach((e: IFPPComponent) => {
            viewlist.components.push(e.name);
        });
        return viewlist;
    }

    public query(viewName: string, viewType: string): any {
        switch (viewType) {
            case ViewType.Function: {
                var cons: IFPPConnection[] = this.topologies.filter(
                    (i) => i.name === viewName)[0].connections;
                let ins: IFPPInstance[] = [];
                cons.forEach((c) => {
                    if (ins.indexOf(c.from.inst) === -1) {
                        ins.push(Object.assign({}, c.from.inst));
                    }
                    if (c.to && ins.indexOf(c.to.inst) === -1) {
                        ins.push(Object.assign({}, c.to.inst));
                    }
                });
                ins = this.filterUnusedPorts(ins, cons);
                return {
                    instances: ins,
                    connections: cons,
                    components: [],
                };
            }
            case ViewType.Component: {
                var ins: IFPPInstance[] = [];
                var cons: IFPPConnection[] = [];
                var comps = this.components.filter((i) => i.name === viewName);
                return {
                    instances: ins,
                    connections: cons,
                    components: comps,
                };
            }
            case ViewType.InstanceCentric: {
                let ins: IFPPInstance[] = [];
                var cons: IFPPConnection[] = [];
                var root = this.instances.filter((i) => i.name === viewName)[0];

                this.topologies.forEach((t) => {
                    t.connections.forEach((c) => {
                        if (c.from.inst === root && c.to) {
                            ins.push(Object.assign({}, c.to.inst));
                            cons.push(c);
                        }
                        if (c.to && c.to.inst === root) {
                            ins.push(Object.assign({}, c.from.inst));
                            cons.push(c);
                        }
                    });
                });
                ins.push(Object.assign({}, root));
                ins = this.filterUnusedPorts(ins, cons);
                return {
                    instances: ins,
                    connections: cons,
                    components: [],
                };
            }
            default: {
                return null;
            }
        }
    }

    public getComponents() {
        return this.components;
    }
    public getPorts() {
        let ret = new Set();
        this.instances.forEach((i) => {
            const ports = i.ports;
           for (const p in ports) {
               ret.add(ports[p]);
           }
        });
        this.components.forEach((i) =>{
            const comPorts = i.ports;
            for (const p of comPorts) {
                ret.add(p);
            }
        });
        return ret;
    }
    public getText() {
        this.generateText();
        return this.text;
    }

    /**
     * addNewDataType
     */
    public addNewDataType(defaultName: string): string {
        const defaultNameSpace: string = "Fw";

        this.push_curr_state_to_stack(this.undo_stack);
        var item: IFPPDataType = {
            name: defaultName,
            namespace: defaultNameSpace,
        };
        this.datatypes.push(item);

        this.generateText();

        fprime.viewManager.updateEditor(this.text);
        return item.namespace + "." + item.name;
    }

    /**
     * Add a new port type to the current model
     * The default values of the port should includes:
     *  - a default name past by param
     *  - instance number of the port type is 0
     * @param defaultName default name of the new port type
     */
    public addNewPortType(defaultName: string): string {
        this.push_curr_state_to_stack(this.undo_stack);
        var porttype: IFPPPortType = {
            name: defaultName,
            namespace: "Fw",
            arg: {},
        };
        this.porttypes.push(porttype);
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return porttype.namespace + "." + porttype.name;
    }

    /**
     * Add a new component to the current model.
     * The default values of the component should includes:
     *  - a default name pass by param
     *  - an unspecified namespace
     *  - an empty port array
     * Then the model should be updated in the source file
     * in an async way.
     *
     * @param defaultName default name of the new component
     */
    public addNewComponent(defaultName: string): string {
        this.push_curr_state_to_stack(this.undo_stack);
        var item: IFPPComponent = {
            name: this.defaultNamespace + "." + defaultName,
            namespace: "Ref",
            ports: [],
            kind: "Active",
        };
        this.components.push(item);
        // TODO: (async) update the model data
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return item.name;
    }

    /**
     * Add a new instance to the current model.
     * The instance should created only when the corresponding component exists.
     * The default values of the instance should includes:
     *  - name: @param defaultName
     *  - base_id: defalt value is -1
     *  - ports: the ports array in the component
     *  - properties including type and namespace
     *
     * @param defaultName default name of the new instance
     * @param cpName name of the corresponding component
     */
    public addNewInstance(defaultName: string, cpName: string): string {
        var ps: { [p: string]: IFPPPort } = {};
        var type = cpName.split("\.");
        if (type.length !== 2) {
            alert("Please specify a namespace before instantiate");
            throw new Error("Invalid type format for [" + cpName + "]");
        }

        this.push_curr_state_to_stack(this.undo_stack);
        var namespace = type[0];
        var name = type[1];
        this.components.forEach((c: IFPPComponent) => {
            if (c.name === namespace + "." + name && c.namespace === namespace) {
                c.ports.forEach((p: IFPPPort) => {
                    ps[p.name] = p;
                });
            }
        });

        var item: IFPPInstance = {
            name: namespace + "." + defaultName,
            base_id: "-1",
            ports: ps,
            properties: {
                ["type"]: cpName,
                ["namespace"]: namespace,
            },
            used_ports: {}, // no port is connected yet, so the set is empty
        };

        this.instances.push(item);
        // TODO: (async) update the model data
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        
        return item.name;
    }

    /**
     * Add an empty function view AKA. new topology
     * The default values of the topology should includes:
     *  - a default name pass by param
     *  - an empty connection array
     * @param defaultName default name of the new function view
     */
    public addNewFunctionView(defaultName: string): string {
        this.push_curr_state_to_stack(this.undo_stack);
        var item: IFPPTopology = {
            name: this.defaultNamespace + "." + defaultName,
            connections: [],
        };
        this.topologies.push(item);
        // TODO: (async) update the model data
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return item.name;
    }

    /**
     * deleteDataType
     * @param name item to delete
     */
    public deleteDataType(name: string): boolean {
        this.push_curr_state_to_stack(this.undo_stack);
        this.datatypes = this.datatypes.filter((i) => (i.namespace + "." + i.name) !== name);
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    /**
     * deletePortType
     * @param name item to delete
     */
    public deletePortType(name: string): boolean {
        this.push_curr_state_to_stack(this.undo_stack);
        this.porttypes = this.porttypes.filter((i) => (i.namespace + "." + i.name) !== name);
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    /**
     * If you want to delete a component,
     * you need to cope with all the relevant instance and topology
     * @param name name of the component to delete
     */
    public deleteComponent(name: string): boolean {
        this.push_curr_state_to_stack(this.undo_stack);
        this.components = this.components.filter((i) => i.name !== name);
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    /**
     * deleteInstance
     * @param name item to delete
     */
    public deleteInstance(name: string): boolean {
        this.push_curr_state_to_stack(this.undo_stack);
        this.instances = this.instances.filter((i) => i.name !== name);
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    public deleteTopology(name: string): boolean {
        this.push_curr_state_to_stack(this.undo_stack);
        this.topologies = this.topologies.filter((i) => i.name !== name);
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    /**
     * renameTopology
     * @param previous the old name of the topology
     * @param newname the new name of the topology
     */
    public renameTopology(previous: string, newname: string) {
        this.push_curr_state_to_stack(this.undo_stack);
        this.topologies = this.topologies.map(i => {
            if(i.name === previous) {
                return {
                    name: newname,
                    connections: i.connections,
                };
            } else {
                return i;
            }
        });
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
    }

    public addPortToComponent(portname: string, compname: string): boolean {
        var porttype = this.porttypes.find((i) => {
            return (i.namespace + "." + i.name) === portname;
        });
        var comp = this.components.find((i) => i.name === compname);
        if (porttype == undefined || comp == undefined) {
            return false;
        }
        // rename the port with the first letter in lower case
        var newPortname = porttype.name.charAt(0).toLowerCase() + porttype.name.slice(1);
        // existing port
        if (comp.ports.find((i) => i.name === newPortname)) {
            // rename the portname
            let index = 1;
            while (comp.ports.find((i) => i.name === (newPortname + index))) {
                index += 1;
            }
            newPortname = newPortname + index;
        }
        this.push_curr_state_to_stack(this.undo_stack);

        var port: IFPPPort = {
            name: newPortname,
            properties: {
                ["direction"]: "in",
                ["kind"]: "",
                ["number"]: 1,
                ["type"]: porttype.namespace + "." + porttype.name,
                ["role"]: "",
            },
        };

        comp.ports.push(port);
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    public addInstanceToTopo(instname: string, toponame: string): boolean {

        const instance = this.instances.find((i) => i.name === instname);
        if (instance === undefined) return false;

        var topology = this.topologies.find((i) => i.name === toponame);
        if (topology == undefined) return false;
        // check if the instance exists in the topology
        // if exist, ignore this operation
        let existinst = topology.connections.find(con => {
            if (con.from.inst.name === instname) {
                return true;
            }
            if (con.to && con.to.inst.name === instname) {
                return true;
            }
            return false;
        });
        if (existinst) {
            return false;
        }
        this.push_curr_state_to_stack(this.undo_stack);

        var halfConnection: IFPPConnection = {
            from: {
                inst: instance,
            },
        };
        topology.connections.push(halfConnection);

        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    public addConnection(toponame: string, from_inst: string, from_port: string,
                         to_inst: string, to_port: string): boolean {
        if (from_inst === to_inst) {
            console.log("can't drag connection on one instance");
            return false;
        }
        var topology = this.topologies.find((i) => i.name === toponame);
        if (topology == undefined) {
            return false;
        }

        var source = this.instances.find((i) => i.name === from_inst);
        if (source == undefined) {
            return false;
        }

        var target = this.instances.find((i) => i.name === to_inst);
        if (target == undefined) {
            return false;
        }

        this.push_curr_state_to_stack(this.undo_stack);

        var newConn: IFPPConnection = {
            from: {
                inst: source,
                port: this.getPortByInstance(source, from_port),
            },
            to: {
                inst: target,
                port: this.getPortByInstance(target, to_port),
            },
        };

        // query if there are existing connection
        var res = topology.connections.filter((con) => {
            return con.from.port && con.to
                && con.from.inst.name === from_inst && con.from.port.name === from_port
                && con.to.inst.name === to_inst && con.to.port.name === to_port;
        });
        if (res.length > 0) {
            console.log("existing connection");
            return false;
        }

        console.log("new connection");
        console.dir(newConn);
        topology.connections.push(newConn);

        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    public removeConnection(toponame: string, from_inst: string, from_port: string,
                            to_inst: string, to_port: string): boolean {
        console.log("rm conn topo:" + toponame + " from: " + from_inst + " " + from_port
            + " to: " + to_inst + " " + to_port);

        if (from_inst === to_inst) {
            return false;
        }
        var topology = this.topologies.find((i) => i.name === toponame);
        if (topology == undefined) {
            return false;
        }

        var source = this.instances.find((i) => i.name === from_inst);
        if (source == undefined) {
            return false;
        }

        var target = this.instances.find((i) => i.name === to_inst);
        if (target == undefined) {
            return false;
        }
        this.push_curr_state_to_stack(this.undo_stack);

        _.remove(topology.connections, (i: IFPPConnection) => {
            return i.from.port && i.to
                && i.from.inst.name === from_inst && i.from.port.name === from_port
                && i.to.inst.name === to_inst && i.to.port.name === to_port;
        });
        // check if the inst has another conn
        // if not, keep the inst exist in the topo
        var id = _.findIndex(topology.connections, (i: IFPPConnection) => {
            return i.from.inst.name === from_inst || (i.to && i.to.inst.name === from_inst);
        });
        // generate an empty connection for the instance
        if (id === -1) {
            topology.connections.push(
                {
                    from: {
                        inst: source
                    }
                }
            );
        }

        // same for target
        id = _.findIndex(topology.connections, (i: IFPPConnection) => {
            return i.from.inst.name === to_inst || (i.to && i.to.inst.name === to_inst);
        });
        if (id === -1) {
            topology.connections.push(
                {
                    from: {
                        inst: target
                    }
                }
            );
        }

        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    public removeInstance(toponame: string, instname: string): boolean {
        console.log("rm instance from the topo");
        var topology = this.topologies.find((i) => i.name === toponame);
        if (topology == undefined) {
            return false;
        }

        var inst = this.instances.find((i) => i.name === instname);
        if (inst == undefined) {
            return false;
        }
        this.push_curr_state_to_stack(this.undo_stack);

        // delete all related connections contains inst
        var related: IFPPInstance[] = [];
        topology.connections = topology.connections.filter((con) => {
            if (con.from.inst.name === instname) {
                if (con.to) {
                    related.push(con.to.inst);
                }
                return false;
            } else if (con.to && con.to.inst.name === instname) {
                related.push(con.from.inst);
                return false;
            } else {
                return true;
            }
        });

        related.forEach((inst) => {
            var id = _.findIndex(topology!.connections, (i: IFPPConnection) => {
                return i.from.inst.name === inst.name || (i.to && i.to.inst.name === inst.name);
            });
            // generate an empty connection for the instance
            if (id === -1) {
                topology!.connections.push(
                    {
                        from: {
                            inst: inst
                        }
                    }
                );
            }
        });

        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        return true;
    }

    /**
     * removePort
     */
    public removePort(compname: string, portname: string): boolean{
        const component = this.components.find((i) => i.name === compname);
        if (component === undefined) { return false; }
        this.push_curr_state_to_stack(this.undo_stack);

        component.ports = component.ports.filter((p => p.name !== portname));
        this.generateText();
        fprime.viewManager.updateEditor(this.text);
        
        return true;
    }

    /**
     * Update the model
     */
  public updateAttributes(type: string, attrs: {[attrname: string]: string}): boolean {
      this.push_curr_state_to_stack(this.undo_stack);
      if (type === ViewType.InstanceCentric) {
          this.instances.forEach((i) => {
              if (i.name === attrs["OldName"]) {
                  console.log("Before", i);
                  i.name = attrs["NewName"];
                  i.properties["type"] = attrs["Type"];
                  i.properties["namespace"] = attrs["NameSpace"];
                  i.base_id = attrs["BaseID"];
                  console.log("After", i);
              }
          });
      }
      if (type === ViewType.Component){
          this.components.forEach((i) => {
              if (i.name === attrs["OldName"]){
                  console.log("Before", i);
                  i.name = attrs["Name"];
                  i.kind = attrs["Kind"];
                  i.namespace = attrs["NameSpace"];
                  // If the name of a component gets changed, all its instances type should
                  // get changed too.
                  if (attrs["OldName"] !== attrs["Name"]){
                      this.instances.forEach((j) =>{
                         if (j.properties["type"] === attrs["OldName"]){
                             j.properties["type"] = attrs["Name"];
                         }
                      });
                  }
                  console.log("after", i);
              }
          });
      }
      if (type === "Port") {

          if (attrs["ViewType"] === ViewType.Component){
              this.components.forEach((i) => {
                  if (i.name === attrs["CompName"]){
                      let ports = i.ports;
                      console.log("type",typeof (ports));
                      for (let p of ports){
                          if (p.name === attrs["OldName"]){
                              console.log("before", p);
                              p.name = attrs["NewName"];
                              p.properties["direction"] = attrs["Direction"];
                              p.properties["name"] = attrs["NewName"];
                              p.properties["number"] = attrs["Number"];
                              p.properties["role"] = attrs["Role"];
                              p.properties["type"] = attrs["Type"];
                              p.properties["kind"] = attrs["Kind"];
                              console.log("after", p);
                              break;
                          }
                      }
                  }
              });
          }
      }

      this.generateText();
      fprime.viewManager.updateEditor(this.text);
      return true;
  }

  /**
   * Output the model into the selected folder
   */
  public writeToFile(folderPath: string) {
        const rimraf = require("rimraf");
        rimraf.sync(folderPath);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        for (var key in this.text) {
            var fileName = path.join(folderPath, key);
            if (!fs.existsSync(getDirName(fileName))) {
                fs.mkdirSync(getDirName(fileName));
            }
            // fs.mkdirSync(getDirName(fileName));
            fs.writeFileSync(fileName, this.text[key]);
        }
        console.dir(this.text);
    }

    /**
     * Generate text according to model
     */
    public generateText() {
        // Clear old text
        this.text = {};

        var tab: string = "    ";

        // TODO: Data Types INCLUDING fprime.fpp
        this.datatypes.forEach((e: IFPPDataType) => {
            var dataTypePath: string = path.join(e.namespace, "DataType.fpp");
            if (!(dataTypePath in this.text)) {
                this.text[dataTypePath] = "namespace " + e.namespace + "\n\n";
            }
            this.text[dataTypePath] += "datatype " + e.name + "\n";
        });

        this.enumtypes.forEach((e: IFPPEnumType) => {
            var enumTypePath: string = path.join(e.namespace, "DataType.fpp");
            if (!(enumTypePath in this.text)) {
                this.text[enumTypePath] = "namespace " + e.namespace + "\n\n";
            }
            this.text[enumTypePath] += "enum " + e.name + " {\n";
            for (var key in e.arg) {
                var value = e.arg[key];
                this.text[enumTypePath] += tab + key + " = " + value + "\n";
            }
            this.text[enumTypePath] += "}\n\n";
        });

        this.porttypes.forEach((e: IFPPPortType) => {
            let portTypePath: string = e.namespace;
            portTypePath = path.join(portTypePath, e.name + ".fpp");

            // If text does not exist, create an empty one
            if (!(portTypePath in this.text)) {
                this.text[portTypePath] = "";
            }

            let portTypeContent: string = "";
            // namespace
            portTypeContent += "namespace " + e.namespace + "\n\n";
            // component name
            portTypeContent += "porttype " + e.name + " {\n";
            // arg
            for (var key in e.arg) {
                var value = e.arg[key].value;
                portTypeContent += tab + "arg " + key + ":" + value;
                if (e.arg[key].pass_by) {
                    portTypeContent += " { pass_by = " + e.arg[key].pass_by + " }";
                }
                portTypeContent += "\n";
            }
            // closing bracket
            portTypeContent += "}";
            // Concatenate to text
            this.text[portTypePath] += portTypeContent;
            // fs.writeFile(portTypePath, portTypeContent, (err) => {
            //     if (err) {
            //         throw err;
            //     }
            // });
        });


        this.components.forEach((e: IFPPComponent) => {
            let componentName = e.name;
            var i = componentName.indexOf(".");
            componentName = componentName.substring(i + 1);
            let componentPath: string = e.namespace;
            componentPath = path.join(componentPath, componentName + ".fpp");

            // If text does not exist, create an empty one
            if (!(componentPath in this.text)) {
                this.text[componentPath] = "";
            }

            let componentContent: string = "";
            // namespace
            componentContent += "namespace " + e.namespace + "\n\n";
            // component name
            componentContent += "component " + componentName + " {\n";
            if (e.kind) {
                componentContent += tab + "kind = " + e.kind + "\n";
            }
            // ports
            for (var port of e.ports) {
                // get type
                var portType: string = port.properties.type;
                componentContent += tab + "port " + port.name + ":" + portType + " {\n";
                // port properties
                for (var key in port.properties) {
                    if (key === "type" || key === "name") {
                        continue;
                    }
                    if (!port.properties[key]) {  // If value is null
                        continue;
                    }
                    // If role is none, do not write
                    if (key === "role") {
                        if (port.properties[key] === "None") {
                            continue;
                        }
                    }
                    componentContent += tab + tab + key + " = ";
                    // For some reason Telemetry should be "Telemetry" instead
                    if (port.properties[key] === "Telemetry") {
                        componentContent += "\"Telemetry\"";
                    } else {
                        componentContent += port.properties[key];
                    }
                    componentContent += "\n";
                }
                componentContent += tab + "}\n";
            }
            // closing bracket
            componentContent += "}";
            // Concatenate to text
            this.text[componentPath] += componentContent;
        });

        // key: namespace
        // value: content
        var instanceContent: { [key: string]: string; } = {};
        this.instances.forEach((e: IFPPInstance) => {
            let instanceName: string = e.name;
            var i = instanceName.indexOf(".");
            var instanceNameSpace = instanceName.substring(0, i);
            instanceName = instanceName.substring(i + 1);
            if (!(instanceNameSpace in instanceContent)) {
                instanceContent[instanceNameSpace] = "namespace " + instanceNameSpace + "\n\n";
                instanceContent[instanceNameSpace] += "system sys {\n";
            }
            // get the component type
            var instanceType: string = e.properties.type;
            // write the instance name first
            instanceContent[instanceNameSpace] += tab + "instance " + instanceName + ":" + instanceType + " {\n";
            // write base_id
            console.dir(e);
            instanceContent[instanceNameSpace] += tab + tab + "base_id = " + e.base_id + "\n";
            // write each instance's properties
            for (var key in e.properties) {
                if (key === "type" || key === "namespace" || key === "base_id") {
                    continue;
                }
                if (!e.properties[key]) {  // If value is null
                    continue;
                }
                instanceContent[instanceNameSpace] += tab + tab + key + " = " + e.properties[key] + "\n";
            }
            // closing bracket
            instanceContent[instanceNameSpace] += tab + "}\n";
        });

        // key: namespace
        // value: content
        var topologyContent: { [key: string]: string; } = {};
        this.topologies.forEach((e: IFPPTopology) => {
            let topologyName: string = e.name;
            var i = topologyName.indexOf(".");
            var topologyNameSpace = topologyName.substring(0, i);
            topologyName = topologyName.substring(i + 1);
            if (!(topologyNameSpace in topologyContent)) {
                topologyContent[topologyNameSpace] = "";
            }
            // write the topology name first
            topologyContent[topologyNameSpace] += tab + "topology " + topologyName + " {\n";
            // write each connection
            for (var connection of e.connections) {
                // Get rid of namespace
                // Modified by Minghui Tang 6/22, only write the valid connections
                if (connection.from.port && connection.to) {
                    let fromInst: string = connection.from.inst.name;
                    fromInst = fromInst.substring(fromInst.indexOf(".") + 1);
                    let fromPort: string = connection.from.port.name;
                    fromPort = fromPort.substring(fromPort.indexOf(".") + 1);
                    let toInst: string = connection.to.inst.name;
                    toInst = toInst.substring(toInst.indexOf(".") + 1);
                    let toPort: string = connection.to.port.name;
                    toPort = toPort.substring(toPort.indexOf(".") + 1);

                    topologyContent[topologyNameSpace] += tab + tab;
                    topologyContent[topologyNameSpace] += fromInst + "." + fromPort;
                    topologyContent[topologyNameSpace] += " -> ";
                    topologyContent[topologyNameSpace] += toInst + "." + toPort + "\n";
                }
            }
            // closing bracket
            topologyContent[topologyNameSpace] += tab + "}\n";
        });

        // write to file for each namespace
        for (var key in instanceContent) {
            let instancePath: string = key;
            instancePath = path.join(instancePath, "System.fpp");

            // If text does not exist, create an empty one
            if (!(instancePath in this.text)) {
                this.text[instancePath] = "";
            }

            // Concatenate to text
            if (instanceContent[key]) {
                this.text[instancePath] += instanceContent[key];
            }
            if (topologyContent[key]) {
                this.text[instancePath] += topologyContent[key];
            }
            this.text[instancePath] += "}";
        }
        console.dir(this.text);
    }

    /**
     * Update text according to the text editor.
     */
    public applyText(files: {[fileName: string]: string}) {
        this.text = files;
        console.dir(this.text);
    }

    /**
     * Dummy function to update text editor according to the ModelManager.
     */
    public updateEditor(_: any): void {
    }

    /**
     * Undo
     */
    public undo(): boolean {
        console.dir(this.datatypes);
        if (this.undo_stack.length > 0) {
            const top = this.undo_stack.pop();
            if (top) {
                console.dir(top.datatypes);
                // Push current state to redo stack
                this.push_curr_state_to_stack(this.redo_stack);
                // Undo action
                this.text = top.text;
                this.datatypes = top.datatypes;
                this.enumtypes = top.enumtypes;
                this.porttypes = top.porttypes;
                this.components = top.components;
                this.instances = top.instances;
                this.topologies = top.topologies;
                fprime.viewManager.updateEditor(this.text);
                return true;
            }
        }
        return false;
    }

    /**
     * Redo
     */
    public redo(): boolean {
        if (this.redo_stack.length > 0) {
            const top = this.redo_stack.pop();
            if (top) {
                // Push current state to undo stack
                this.push_curr_state_to_stack(this.undo_stack);
                // Redo action
                this.text = top.text;
                this.datatypes = top.datatypes;
                this.enumtypes = top.enumtypes;
                this.porttypes = top.porttypes;
                this.components = top.components;
                this.instances = top.instances;
                this.topologies = top.topologies;
                fprime.viewManager.updateEditor(this.text);
                return true;
            }
        }
        return false;
    }

    private push_curr_state_to_stack(stack: IStackEle[]) {
        // Pop first if undo stack is full
        if (stack.length >= this.MAX_undo_redo) {
            stack.shift();
        }
        // Push current state to undo deque
        const curr: IStackEle = {
            text: this.text,
            datatypes: _.cloneDeep(this.datatypes) as IFPPDataType[],
            enumtypes: _.cloneDeep(this.enumtypes) as IFPPEnumType[],
            instances: _.cloneDeep(this.instances) as IFPPInstance[],
            topologies: _.cloneDeep(this.topologies) as IFPPTopology[],
            components: _.cloneDeep(this.components) as IFPPComponent[],
            porttypes: _.cloneDeep(this.porttypes) as IFPPPortType[],
        };
        stack.push(curr);
    }

    public reset() {
        this.datatypes = [];
        this.porttypes = [];
        this.instances = [];
        this.topologies = [];
        this.components = [];
        this.datatypes = [];
        this.enumtypes = [];
        this.text = {};
        // this.undo_stack = [];
        // this.redo_stack = [];
    }

    private generatePortType(porttypes: any[]): IFPPPortType[] {
        var res: IFPPPortType[] = [];

        if (porttypes == null || porttypes.length === 0) {
            return res;
        }

        porttypes.forEach((ele: any) => {
            var args: { [key: string]: { value: string, pass_by: string } } = {};
            ele.arg.forEach((a: any) => {
                args[a.$.name] = {value: a.$.type, pass_by: a.$.pass_by};
            });
            var pt: IFPPPortType = {
                name: ele.$.name,
                namespace: ele.$.namespace,
                arg: args,
            };
            res.push(pt);
        });

        return res;
    }

    private generateDataType(datatypes: any[]): IFPPDataType[] {
        var res: IFPPDataType[] = [];

        if (datatypes == null || datatypes.length === 0) {
            return res;
        }

        datatypes.forEach((ele: any) => {
            var pt: IFPPDataType = {
                name: ele.$.name,
                namespace: ele.$.namespace,
            };
            res.push(pt);
        });

        return res;
    }

    private generateEnumType(enumtypes: any[]): IFPPEnumType[] {
        var res: IFPPEnumType[] = [];
        if (enumtypes == null || enumtypes.length === 0) {
            return res;
        }

        enumtypes.forEach((ele: any) => {
            var args: { [key: string]: number } = {};
            ele.item.forEach((a: any) => {
                args[a.$.name] = a._;
            });
            var pt: IFPPEnumType = {
                name: ele.$.name,
                namespace: "fprime",
                arg: args,
            };
            res.push(pt);
        });

        return res;
    }

    private generateComponents(components: any[]): IFPPComponent[] {
        var res: IFPPComponent[] = [];

        if (components == null || components.length === 0) {
            return res;
        }

        components.forEach((ele: any) => {
            var ps: IFPPPort[] = [];
            ele.port.forEach((port: any) => {
                var p: IFPPPort = {
                    name: port.$.name,
                    properties: {},
                };

                p.properties = port.$;
                ps.push(p);
            });
            var ns = ele.$.namespace;

            res.push({
                name: ns + "." + ele.$.name,
                namespace: ns,
                ports: ps,
                kind: ele.$.kind,
            });
        });

        return res;
    }

    private generateInstances(ns: string, instances: any[]): IFPPInstance[] {
        var res: IFPPInstance[] = [];

        if (instances == null || instances.length === 0) {
            return res;
        }

        instances.forEach((ele: any) => {
            var props: { [p: string]: string } = {};
            for (var key in ele.$) {
                if (!ele.$.hasOwnProperty(key)) {
                    continue;
                }
                if (this.keywords.indexOf(key) === -1) {
                    props[key] = ele.$[key];
                }
            }
            var ps: { [p: string]: IFPPPort } = {};
            if (ele.$.type === null) {
                throw new Error("The type of element is null.");
            }

            var type = ele.$.type.split("\.");
            if (type.length !== 2) {
                throw new Error("Invalid type format for [" + type + "]");
            }

            var namespace = type[0];
            var name = type[1];
            this.components.forEach((c: IFPPComponent) => {
                if (c.name === namespace + "." + name && c.namespace === namespace) {
                    c.ports.forEach((p: IFPPPort) => {
                        ps[p.name] = p;
                    });
                }
            });

            res.push({
                name: ns + "." + ele.$.name,
                base_id: ele.$.base_id,
                ports: ps,
                properties: props,
                used_ports: {},
            });
        });

        return res;
    }

    private generateTopologies(ns: string, topologies: any[]): IFPPTopology[] {
        var res: IFPPTopology[] = [];
        if (topologies == null) {
            return res;
        }

        topologies.forEach((ele: any) => {
            var cons: IFPPConnection[] = [];
            ele.connection.forEach((con: any) => {
                var source = this.instances.filter(
                    (i) => i.name === ns + "." + con.source[0].$.instance)[0];
                var target = this.instances.filter(
                    (i) => i.name === ns + "." + con.target[0].$.instance)[0];


                cons.push({
                    from: {
                        inst: source,
                        port: this.getPortByInstance(source, con.source[0].$.port),
                    },
                    to: {
                        inst: target,
                        port: this.getPortByInstance(target, con.target[0].$.port),
                    },
                });
            });

            res.push({
                name: ns + "." + ele.$.name,
                connections: cons,
            });
        });

        return res;
    }

    private getPortByInstance(
        ins: IFPPInstance, portName: string): IFPPPort {
        return this.getPortsByInstance(ins)
            .filter((p) => p.name === portName)[0];
    }

    private getPortsByInstance(ins: IFPPInstance): IFPPPort[] {
        var prop: string[] = ins.properties.type.split(".");
        var name: string = prop[1];
        var namespace: string = prop[0];
        var comp = this.components.filter(
            (c) => c.name === namespace + "." + name && c.namespace === namespace,
        )[0];
        return comp.ports;
    }

    private filterUnusedPorts(
        ins: IFPPInstance[], cons: IFPPConnection[],
    ): IFPPInstance[] {
        ins.forEach((i) => {
            var ps: { [k: string]: IFPPPort } = {};
            Object.keys(i.ports).forEach((key) => {
                var p = i.ports[key];
                cons.forEach((c) => {
                    if (c.from.port && c.from.port.name === p.name) {
                        ps[key] = p;
                    }
                    if (c.to && c.to.port.name === p.name) {
                        ps[key] = p;
                    }
                });
            });
            i.used_ports = ps;
        });
        return ins;
    }
}
