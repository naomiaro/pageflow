pageflow.app.addInitializer(function() {
  _.each(pageflow.editor.sideBarRoutings, function(options) {
    new options.router({
      controller: new options.controller({
        region: pageflow.app.sidebarRegion,
        entry: pageflow.entry
      })
    });
  });

  window.editor = new pageflow.SidebarRouter({
    controller: new pageflow.SidebarController({
      region: pageflow.app.sidebarRegion,
      entry: pageflow.entry
    })
  });
});
