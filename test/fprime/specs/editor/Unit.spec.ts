import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import ViewManager from "fprime/ViewManagement/ViewManager";
import { ICytoscapeJSON } from "fprime/ViewManagement/ViewDescriptor";
import { NodeType, EdgeType } from "fprime/ViewManagement/ViewDescriptor";
import { ViewType } from "fprime/FPPModelManagement/FPPModelManager";
import { IRenderJSON } from "fprime/ViewManagement/ViewDescriptor";

const __project = "./test/Ref1";
const viewName = "Ref.REFLogger";

const sample_elements = {
  nodes: [
    {
      data: { id: "ins_1" },
      classes: NodeType.Instance,
      position: { x: 50, y: 50 },
    },
    {
      data: { id: "ins_1_p1" },
      classes: NodeType.Port,
      position: { x: 60, y: 60 },
    },
    {
      data: { id: "ins_2" },
      classes: NodeType.Instance,
      position: { x: 200, y: 200 },
    },
    {
      data: { id: "ins_2_p1" },
      classes: NodeType.Port,
      position: { x: 210, y: 210 },
    },
  ],
  edges: [
    {
      data: {
        id: "ins_1-ins_1_p1",
        source: "ins_1",
        target: "ins_1_p1",
      },
      classes: EdgeType.Instance2Port,
    },
    {
      data: {
        id: "ins_2-ins_2_p1",
        source: "ins_2",
        target: "ins_2_p1",
      },
      classes: EdgeType.Instance2Port,
    },
    {
      data: {
        id: "ins_1_p1-ins_2_p1",
        source: "ins_1_p1",
        target: "ins_2_p1",
      },
      classes: EdgeType.Port2Port,
    },
  ],
};

const json: ICytoscapeJSON = {
  style: [
    {
      selector: ".fprime-instance",
      style: {
        height: "100",
        width: "100",
      },
    },
    {
      selector: "#ins_1",
      style: {
        "width": "200",
        "height": "200",
        "background-color": "red",
      },
    },
  ],
  elements: sample_elements
};

describe("ViewManager rerender", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should rerender as expect format", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    let modifiedjson: ICytoscapeJSON = {
      style: [
        {
          selector: "#ins_1",
          style: {
            "width": "100",
            "height": "100",
            "background-color": "blue",
          },
        },
      ],
      elements: sample_elements,
    }
    
    viewManager.updateViewDescriptorFor(viewName, json);
    let after: IRenderJSON | null= viewManager.rerender(viewName, modifiedjson);
    expect(after).to.not.be.null;
    expect(after!.descriptor.style).to.deep.include(modifiedjson.style[0])
  })

  it("should rerender as the default setting if never render before", async () => {
    await viewManager.build(__project);
    let render_result = viewManager.render(viewName);
    viewManager.closeViewDescriptor(viewName); // clear the render result
    let rerender_result = viewManager.rerender(viewName, json);

    expect(render_result).to.deep.equal(rerender_result);
  });

  it("should return null if no json pass by", () => {
    let result = viewManager.rerender("", {} as ICytoscapeJSON);
    expect(result).is.null;
  })

});

describe("ViewManager getComponents", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should get all expected components information", async () => {
    await viewManager.build(__project);
    expect(viewManager.getComponents()).to.be.lengthOf(7);
  });

});

describe("ViewManager getPorts", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should get all expected ports information", async () => {
    await viewManager.build(__project);
    expect(viewManager.getPorts()).to.be.lengthOf(28);
  });

});

describe("ViewManager getText", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should get all expected text", async () => {
    await viewManager.build(__project);
    viewManager.getText().then(text => 
      expect(text).to.have.property('Ref\\PingReceiver.fpp'));
  });
});

describe("ViewManager generateText", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should generateText as expected", async () => {
    await viewManager.build(__project);
    viewManager.generateText();
    viewManager.getText().then(text => 
      expect(text).to.have.property('Ref\\PingReceiver.fpp'));
  });
});

describe("ViewManager addNewItem", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should add an data type", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    let view_type = ViewType.DataType;
    let item = viewManager.addNewItem(view_type);
    let added = {
       "name": "Fw.NewDataType1",
       "type": view_type
    }
    expect(item).to.deep.equal(added);
  });

  it ("should add an port type", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    let view_type = ViewType.PortType;
    let item = viewManager.addNewItem(view_type);
    let added = {
       "name": "Fw.NewPortType1",
       "type": view_type
    }
    expect(item).to.deep.equal(added);
  });

  it ("should add a component", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    let view_type = ViewType.Component;
    let item = viewManager.addNewItem(view_type);
    let added = {
       "name": "Ref.NewComponent1",
       "type": view_type
    }
    expect(item).to.deep.equal(added);
  });

  it ("should add an instance", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    let view_type = ViewType.InstanceCentric;
    let ns = "Ref";
    let item = viewManager.addNewItem(view_type, ns + ".PingReceiver");
    let added = {
       "name": ns + ".NewInstance1",
       "type": view_type
    }
    expect(item).to.deep.equal(added);
  });

  it ("should add an instance even if no component is specified", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    let view_type = ViewType.InstanceCentric;
    let item = viewManager.addNewItem(view_type);
    let added = {
       "name": "Ref.NewInstance1",
       "type": view_type
    }
    expect(item).to.deep.equal(added);
  });
  
  it ("should add a topology", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    let view_type = ViewType.Function;
    let item = viewManager.addNewItem(view_type);
    let added = {
       "name": "Ref.NewTopology1",
       "type": view_type
    }
    expect(item).to.deep.equal(added);
  });
});

describe("ViewManager removeItem", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should remove an component as expected", async () => {
    await viewManager.build(__project);
    let target_name = 'Ref.PingReceiver';
    let target_type = ViewType.Component;
    viewManager.removeItem(target_name, target_type);
    expect(viewManager.ViewList).to.not.deep.include({
      name: target_name,
      type: target_type
    })
  });

  it ("should remove an instance as expected", async () => {
    await viewManager.build(__project);
    let target_name = 'Ref.SG1';
    let target_type = ViewType.InstanceCentric;
    viewManager.removeItem(target_name, target_type);
    expect(viewManager.ViewList).to.not.deep.include({
      name: target_name,
      type: target_type
    })
  });

  it ("should remove an topology as expected", async () => {
    await viewManager.build(__project);
    let target_name = 'Ref.REFLogger';
    let target_type = ViewType.Function;
    viewManager.removeItem(target_name, target_type);
    expect(viewManager.ViewList).to.not.deep.include({
      name: target_name,
      type: target_type
    })
  });

  it ("should remove an port type as expected", async () => {
    await viewManager.build(__project);
    let target_name = "Fw.NewPortType1";
    let target_type = ViewType.PortType;
    viewManager.addNewItem(target_type);
    viewManager.removeItem(target_name, target_type);
    expect(viewManager.ViewList).to.not.deep.include({
      name: target_name,
      type: target_type
    })
  });
  
  it ("should remove an data type as expected", async () => {
    await viewManager.build(__project);
    let target_name = "Fw.NewDataType1";
    let target_type = ViewType.DataType;
    viewManager.addNewItem(target_type);
    viewManager.removeItem(target_name, target_type);
    expect(viewManager.ViewList).to.not.deep.include({
      name: target_name,
      type: target_type
    })
  });
});

describe("ViewManager addPortToComponent", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should add an existing port to a component as expected", async() => {
    await viewManager.build(__project);
    
    let comp_name = viewManager.addNewItem(ViewType.Component).name;
    let port_name = viewManager.addNewItem(ViewType.PortType).name;
    viewManager.addPortToComponent(port_name, comp_name);
    let comp = viewManager.getComponents().find(c => c.name === comp_name);
    expect(comp).not.to.be.null.that.to.has.nested.include({'ports[0].name': port_name});
  });

  it ("should not make any change if the component or port is illegal", async () => {
    await viewManager.build(__project);
    expect(viewManager.addPortToComponent("invalid_port_name", "invalid_comp_name")).to.be.false;
  });

  it ("should be able to add a new port even if the port exists", async() => {
    await viewManager.build(__project);
    let comp_name = viewManager.addNewItem(ViewType.Component).name;
    let port_name = viewManager.addNewItem(ViewType.PortType).name;
    viewManager.addPortToComponent(port_name, comp_name);
    let comp = viewManager.getComponents().find(c => c.name === comp_name);
    expect(comp).not.to.be.null.that.to.has.nested.include({'ports[0].name': port_name});

    viewManager.addPortToComponent(port_name, comp_name);
    expect(comp!.ports).to.have.lengthOf(2);
    expect(comp).not.to.be.null.that.to.has.nested.include({'ports[0].name': (port_name + 1)});

    viewManager.addPortToComponent(port_name, comp_name);
    expect(comp!.ports).to.have.lengthOf(3);
    expect(comp).not.to.be.null.that.to.has.nested.include({'ports[0].name': (port_name + 2)});
  })
});

describe("ViewManager addInstanceToTopo", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should return true if adding is valid", async() => {
    await viewManager.build(__project);
    
    let inst_name = viewManager.addNewItem(ViewType.InstanceCentric, "Ref.PingReceiver").name;
    let topo_name = viewManager.addNewItem(ViewType.Function).name;
    expect(viewManager.addInstanceToTopo(inst_name, topo_name)).to.be.true;

    expect(viewManager.addInstanceToTopo("Ref.SG1", topo_name)).to.be.true;
  });

  it ("should return false if the instance exists", async() => {
    await viewManager.build(__project);
    
    let inst_name = viewManager.addNewItem(ViewType.InstanceCentric, "Ref.PingReceiver").name;
    let topo_name = viewManager.addNewItem(ViewType.Function).name;
    expect(viewManager.addInstanceToTopo(inst_name, topo_name)).to.be.true;
    expect(viewManager.addInstanceToTopo(inst_name, topo_name)).to.be.false;
  });

  it ("should return false if the instance or topology is invalid", async() => {
    await viewManager.build(__project);

    expect(viewManager.addInstanceToTopo("", "")).to.be.false;
  });
});

describe("ViewManager updateAttributes", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should return true if component updates is valid", async() => {
    await viewManager.build(__project);
    
    expect(viewManager.updateAttributes(ViewType.Component, {
      ["OldName"]: "Ref.PingReceiver",
      ["Name"]: "Ref1.PingReceiver",
      ["NameSpace"]: "Ref1",
      ["Kind"]: "passive",
    })).to.be.true;

    expect(viewManager.updateAttributes(ViewType.Component, {
      ["OldName"]: "Ref.PingReceiver",
      ["Name"]: "Ref1.PingReceiver",
      ["NameSpace"]: "Ref1",
      ["Kind"]: "passive",
    })).to.be.true;
  });

  it ("should return true if instance updates is valid", async() => {
    await viewManager.build(__project);
    expect(viewManager.updateAttributes(ViewType.InstanceCentric, {
      ["Name"]: "SG1",
      ["OldName"]: "Ref.SG1",
      ["NewName"]: "Svc.SG1",
      ["NameSpace"]: "Svc",
      ["Type"]: "Ref.SignalGen",
      ["BaseID"]: "180"
    })).to.be.true;
  });

  it ("should return true if port updates is valid", async() => {
    await viewManager.build(__project);
    
    expect(viewManager.updateAttributes("Port", {
      ["CompName"]: "Ref.PingReceiver",
      ["Direction"]: "in", 
      ["Kind"]: "async",
      ["Name"]: "PingOut",
      ["NewName"]: "PingOut",
      ["Number"]: "1",
      ["OldName"]: "PingOut",
      ["Role"]: "Cmd",
      ["Type"]: "Fw.Time",
      ["ViewType"]: ViewType.Component,
    })).to.be.true;
  });

  it ("should return true even if updates is valid", async() => {
    await viewManager.build(__project);
    
    expect(viewManager.updateAttributes(ViewType.Component, {
      ["OldName"]: "",
      ["Name"]: "",
      ["NameSpace"]: "",
      ["Kind"]: "",
    })).to.be.true;

    expect(viewManager.updateAttributes(ViewType.InstanceCentric, {
      ["OldName"]: "",
      ["Name"]: "",
      ["NameSpace"]: "",
      ["Kind"]: "",
    })).to.be.true;

    expect(viewManager.updateAttributes("Port", {
      ["OldName"]: "",
      ["Name"]: "",
      ["NameSpace"]: "",
      ["Kind"]: "",
    })).to.be.true;
  });


});

describe("ViewManager addConnection", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should return true if adding is valid", async() => {
    await viewManager.build(__project);
    
    expect(viewManager.addConnection("Ref.REFLogger", 
    "Ref_SG3_cmdRegOut", 
    "Ref_eventLogger_pingIn")).to.be.true;
  });
  
  it ("should return fasle if connections are ports on the same instance", async() => {
    await viewManager.build(__project);
    
    expect(viewManager.addConnection("Ref.REFLogger", 
    "Ref_SG4_timeCaller", 
    "Ref_SG4_cmdIn")).to.be.false;
  });

  it ("should return fasle if adding name is invalid", async() => {
    await viewManager.build(__project);
    
    expect(viewManager.addConnection("invalid1", "invalid2", "invalid3")).to.be.false;
  });

  it ("should return fasle if the connection already exists", async() => {
    await viewManager.build(__project);
    
    expect(viewManager.addConnection("Ref.REFLogger", 
    "Ref_SG2_logTextOut", 
    "Ref_textLogger_TextLogger")).to.be.false;
  });
});

describe("ViewManager removeConnection", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should return true if remove is valid", async() => {
    await viewManager.build(__project);
    expect(viewManager.removeConnection("Ref.REFLogger", 
    "Ref_SG1_logTextOut", 
    "Ref_textLogger_TextLogger")).to.be.true;
  });

  it ("should return false if two connections on the same instance", async() => {
    await viewManager.build(__project);
    expect(viewManager.removeConnection("Ref.REFLogger", 
    "Ref_SG1_logTextOut", 
    "Ref_SG1_logTextOut")).to.be.false;
  });

  it ("should return false if remove is invalid", async() => {
    await viewManager.build(__project);
    expect(viewManager.removeConnection("Ref.invalid", 
    "Ref_SG1_logTextOut", 
    "Ref_textLogger_TextLogger")).to.be.false;

    expect(viewManager.removeConnection("Ref.REFLogger", 
    "Ref_invalid_logTextOut", 
    "Ref_textLogger_TextLogger")).to.be.false;

    expect(viewManager.removeConnection("Ref.REFLogger", 
    "Ref_SG1_logTextOut", 
    "Ref_invalid_TextLogger")).to.be.false;
  });

  it ("should return true if remove cause the instance disappears", async() => {
    await viewManager.build(__project);
    expect(viewManager.removeConnection("Ref.REFTime", 
    "Ref_SG1_timeCaller", 
    "Ref_linuxTime_timeGetPort")).to.be.true;
  });
});

describe("ViewManager removeInstance", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should return true if remove is valid", async() => {
    await viewManager.build(__project);
    expect(viewManager.removeInstance("Ref.REFLogger", 
    "Ref.SG1")).to.be.true;
  });

  it ("should return false if remove is valid", async() => {
    await viewManager.build(__project);
    expect(viewManager.removeInstance("Ref.invalid", 
    "Ref.SG1")).to.be.false;

    expect(viewManager.removeInstance("Ref.REFLogger", 
    "Ref.invalid")).to.be.false;
  });

  it ("should return true even if it causes all connections deleted", async() => {
    await viewManager.build(__project);
    expect(viewManager.removeInstance("Ref.REFTime", 
    "Ref.linuxTime")).to.be.true;
  })
});

describe("ViewManager removePort", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should return true if remove is valid", async() => {
    await viewManager.build(__project);
    expect(viewManager.removePort("Ref.PingReceiver", 
    "PingOut")).to.be.true;
  });

  it ("should return false if remove is valid", async() => {
    await viewManager.build(__project);
    expect(viewManager.removePort("Ref.invalid", 
    "PingOut")).to.be.false;

    expect(viewManager.removeInstance("Ref.REFLogger", 
    "invalid")).to.be.false;
  });
});

describe("ViewManager undo", () => {
  let viewManager: ViewManager;

  it ("should recover the previous model if change is made", async() => {
    viewManager = new ViewManager();
    await viewManager.build(__project);
    expect(viewManager.getComponents()).to.be.lengthOf(7);
    viewManager.addNewItem(ViewType.Component);
    expect(viewManager.getComponents()).to.be.lengthOf(8);
    viewManager.undo();
    expect(viewManager.getComponents()).to.be.lengthOf(7);

  });

  it ("should return false if no previous change is made", async() => {
    viewManager = new ViewManager();
    await viewManager.build(__project);
    expect(viewManager.getComponents()).to.be.lengthOf(7);
    expect(viewManager.undo()).to.be.true;
    expect(viewManager.getComponents()).to.be.lengthOf(0);
    expect(viewManager.undo()).to.be.false;
  });

});

describe("ViewManager redo", () => {
  let viewManager: ViewManager;

  it ("should recover the previous model if undo is made", async() => {
    viewManager = new ViewManager();
    await viewManager.build(__project);
    viewManager.addNewItem(ViewType.Component);
    expect(viewManager.getComponents()).to.be.lengthOf(8);
    viewManager.undo();
    expect(viewManager.getComponents()).to.be.lengthOf(7);
    viewManager.redo();
    expect(viewManager.getComponents()).to.be.lengthOf(8);
  });

  it ("should return false if no undo before", async() => {
    viewManager = new ViewManager();
    await viewManager.build(__project);
    expect(viewManager.redo()).to.be.false;
  });

});

describe("ViewManager newProject", () => {
  let viewManager: ViewManager;
  it ("should have no elements in the new built model", async() => {
    viewManager = new ViewManager();
    viewManager.newProject("./test/Ref2/new_model").then(() => {
      expect(viewManager.getComponents()).to.be.lengthOf(0);
    });
  });
});

describe("ViewManager writeToFile", () => {
  let viewManager: ViewManager;
  it ("should write model down in the given path", async() => {
    viewManager = new ViewManager();
    viewManager.build(__project).then(()=> {
      let newpath = "./test/Ref2/new_model";
      viewManager.writeToFile(newpath);
      expect(fs.existsSync(path.join(newpath + "Ref"))).to.be.true;
    });
  });
});

describe("ViewManager renameItem", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should rename topology as expected", async () => {
    await viewManager.build(__project);
    let new_name = "Ref.REFLogger1";
    viewManager.renameItem("Ref.REFLogger", new_name);
    expect(viewManager.ViewList[ViewType.Function]).to.deep.include({
      name: new_name,
      type: ViewType.Function,
    });
  });
});

describe("ViewManager updateViewList", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should updateViewList and return true", async () => {
    await viewManager.build(__project);
    expect(viewManager.updateViewList(ViewType.Function, "Ref.REFLogger")).to.be.true;
    expect(viewManager.ViewList[ViewType.Function]).to.be.lengthOf.above(0);
  });
});