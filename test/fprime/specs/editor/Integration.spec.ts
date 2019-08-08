import { expect } from "chai";
import ViewManager from "fprime/ViewManagement/ViewManager";
import { ViewType } from "fprime/FPPModelManagement/FPPModelManager";

const __project = "./test/Ref1";

describe("ViewManager", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it ("should perform the CRUD scenario", async () => {
    await viewManager.build(__project);
    let view_type = ViewType.DataType;
    let view_name = "Fw.NewDataType1";
    let item = viewManager.addNewItem(view_type);
    expect(item).to.deep.equal({
      name: "Fw.NewDataType1",
      type: ViewType.DataType
   });

    view_type = ViewType.PortType;
    view_name = "Fw.NewPortType1";
    item = viewManager.addNewItem(view_type);
    expect(item).to.deep.equal({
      name: "Fw.NewPortType1",
      type: ViewType.PortType
   });

    view_type = ViewType.Component;
    view_name = "Fw.NewComponent1";
    item = viewManager.addNewItem(view_type);
    expect(item).to.deep.equal({
      name: "Fw.NewComponent1",
      type: ViewType.Component
   });

    view_type = ViewType.InstanceCentric;
    view_name = "Fw.NewInstance1";
    item = viewManager.addNewItem(view_type, "Fw.NewComponent1");
    expect(item).to.deep.equal({
      name: "Fw.NewInstance1",
      type: ViewType.InstanceCentric
   });

    item = viewManager.addNewItem(view_type);
    expect(item).to.deep.equal({
      name: "Fw.NewTopology1",
      type: ViewType.Function
   });

   viewManager.removeItem("Fw.NewDataType1", ViewType.DataType);
    expect(viewManager.ViewList).to.not.deep.include({
      name: "Fw.NewDataType1",
      type: ViewType.DataType
    });

    viewManager.removeItem("Fw.NewPortType1", ViewType.PortType);
    expect(viewManager.ViewList).to.not.deep.include({
      name: "Fw.NewPortType1",
      type: ViewType.PortType
    });

   viewManager.removeItem("Fw.NewComponent1", ViewType.Component);
    expect(viewManager.ViewList).to.not.deep.include({
      name: "Fw.NewComponent1",
      type: ViewType.Component
    });

    viewManager.removeItem("Fw.NewInstance1", ViewType.InstanceCentric);
    expect(viewManager.ViewList).to.not.deep.include({
      name: "Fw.NewInstance1",
      type: ViewType.InstanceCentric
    });

    viewManager.removeItem(view_name, ViewType.Function);
    expect(viewManager.ViewList).to.not.deep.include({
      name: "Fw.NewTopology1",
      type: ViewType.Function
    });
  })

  it ("should perform undo-redo scenario", async() => {
    expect(viewManager.getComponents()).to.be.lengthOf(0);
    expect(viewManager.undo()).to.be.false;
    await viewManager.build(__project);
    expect(viewManager.getComponents()).to.be.lengthOf(7);
    viewManager.addNewItem(ViewType.Component);
    expect(viewManager.getComponents()).to.be.lengthOf(8);
    viewManager.undo();
    expect(viewManager.getComponents()).to.be.lengthOf(7);
    viewManager.redo();
    expect(viewManager.getComponents()).to.be.lengthOf(8);
    viewManager.addNewItem(ViewType.Component);
    expect(viewManager.getComponents()).to.be.lengthOf(9);
    viewManager.undo();
    expect(viewManager.getComponents()).to.be.lengthOf(8);
    viewManager.redo();
    expect(viewManager.getComponents()).to.be.lengthOf(9);

  });
});
