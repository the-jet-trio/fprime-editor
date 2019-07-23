import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import ViewManager from "fprime/ViewManagement/ViewManager";
import { ICytoscapeJSON } from "fprime/ViewManagement/ViewDescriptor";
import { NodeType, EdgeType } from "fprime/ViewManagement/ViewDescriptor";

const __project = "./test/Ref1";
const viewName = "Ref.REFLogger";

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
  elements: {
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
  },
};

describe("ViewManager rerender", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it("should return null when name is empty", () => {
    // expect(viewManager.render("")).to.equal(null);
  });

  it("should return null if name not in view list", () => {
    // expect(viewManager.render("invalid_view")).to.equal(null);
  });

  it("should return null if the project is not built", () => {
    // expect(viewManager.render(viewName)).to.equal(null);
  });

  it("should show unused ports if filterPorts boolean is true",
     async () => {
    // await viewManager.build(__project);
    // expect(viewManager.render(viewName)!.needLayout).to.equal(true);
  });

  it("should not show unused ports if filterPorts boolean is false",
     async () => {
    // await viewManager.build(__project);
    // expect(viewManager.render(viewName)!.needLayout).to.equal(true);
  });

  it("should not show unused ports if no filterPorts parameter pass by",
     async () => {
    // await viewManager.build(__project);
    // expect(viewManager.render(viewName)!.needLayout).to.equal(true);
  });

  it("should use defalut style format if no old json pass by", () => {
    // TODO
  })

});

describe("ViewManager getComponents", () => {

});

describe("ViewManager getText", () => {
  
});

describe("ViewManager generateText", () => {
  
});

describe("ViewManager applyText", () => {
  
});

describe("ViewManager addNewItem", () => {
  
});

describe("ViewManager removeItem", () => {
  
});

describe("ViewManager addPortToComponent", () => {
  
});

describe("ViewManager addInstanceToTopo", () => {
  
});

describe("ViewManager updateAttributes", () => {
  
});

describe("ViewManager addConnection", () => {
  
});

describe("ViewManager removeConnection", () => {
  
});

describe("ViewManager removeInstance", () => {
  
});
