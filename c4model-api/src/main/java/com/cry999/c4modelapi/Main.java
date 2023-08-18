package com.cry999.c4modelapi;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.structurizr.Workspace;
import com.structurizr.dsl.StructurizrDslParser;
import com.structurizr.model.Element;
import com.structurizr.view.ComponentView;
import com.structurizr.view.ContainerView;
import com.structurizr.view.StaticView;
import com.structurizr.view.SystemContextView;
import com.structurizr.view.SystemLandscapeView;

@RestController
@CrossOrigin(origins = "*")
@SpringBootApplication
public class Main {
	private final String DSL_PATH = "workspace.dsl";
	private StructurizrDslParser parser;
	private Workspace workspace;
	private Map<String, String> elementHasContextView;
	private Map<String, String> elementHasContainerView;
	private Map<String, String> elementHasComponentView;
	private Map<String, String> elementHasDeploymentView;
	private Map<String, Map<String, DynamicViewResponse>> dynamicViewsByElement;

	public static void main(String[] args) {
		SpringApplication.run(Main.class, args);
	}

	private static List<String> parseTechnology(String technology) {
		if (technology == null) {
			return null;
		}
		technology = technology.trim();
		if (technology.isEmpty()) {
			return null;
		}
		var splitByAnd = technology.split(" (A|and) ");
		var technologies = new ArrayList<String>();
		for (String s : splitByAnd) {
			technologies.addAll(
					Arrays.asList(s.split(",\s*")));
		}
		return technologies;
	}

	public Main() throws Exception {
		var dsl = new File(DSL_PATH);

		parser = new StructurizrDslParser();
		parser.parse(dsl);
		workspace = parser.getWorkspace();
		elementHasContextView = new HashMap<>();
		for (var view : workspace.getViews().getSystemContextViews()) {
			var belongsTo = view.getSoftwareSystem();
			elementHasContextView.put(belongsTo.getId(), "/context/%s".formatted(view.getKey()));
		}
		elementHasContainerView = new HashMap<>();
		for (var view : workspace.getViews().getContainerViews()) {
			var belongsTo = view.getSoftwareSystem();
			elementHasContainerView.put(belongsTo.getId(), "/container/%s".formatted(view.getKey()));
		}
		elementHasComponentView = new HashMap<>();
		for (var view : workspace.getViews().getComponentViews()) {
			var belongsTo = view.getContainer();
			elementHasComponentView.put(belongsTo.getId(), "/component/%s".formatted(view.getKey()));
		}
		elementHasDeploymentView = new HashMap<>();
		for (var view : workspace.getViews().getDeploymentViews()) {
			var belongsTo = view.getSoftwareSystem();
			elementHasDeploymentView.put(belongsTo.getId(), "/deployment/%s".formatted(view.getKey()));
		}
		dynamicViewsByElement = new HashMap<>();
		for (var view : workspace.getViews().getDynamicViews()) {
			var elementId = view.getElementId();
			var dst = dynamicViewsByElement.getOrDefault(elementId, new HashMap<>());
			var steps = new HashMap<String, String>();
			for (var relView : view.getRelationships()) {
				steps.put(relView.getOrder(), relView.getId());
			}
			dst.put(view.getKey(), new DynamicViewResponse(view.getKey(), view.getName(), view.getTitle(), steps));
			dynamicViewsByElement.put(elementId, dst);
		}
	}

	private record ViewResponse(String id, String name, String description) {
	}

	private record ViewSetResponse(
			List<ViewResponse> landscapes,
			List<ViewResponse> contexts,
			List<ViewResponse> containers,
			List<ViewResponse> components) {
	}

	private record DynamicViewResponse(String id, String name, String title, Map<String, String> steps) {
	}

	private record Relationship(String id, String sourceId, String destinationId, String description,
			List<String> technologies,
			Set<String> tags) {
	}

	private record ElementResponse(String id, String name, String description, String viewUrl, Boolean isChild,
			List<String> technologies,
			Set<String> tags) {
	}

	private record AutoLayout(String direction, Integer rankSeparation, Integer nodeSeparation) {
	}

	private record DiagramResponse(String id, String name, String title, AutoLayout layout,
			List<ElementResponse> elements,
			List<Relationship> relationships,
			Map<String, DynamicViewResponse> dynamicViews) {
	}

	@GetMapping("/views")
	public ViewSetResponse views() {
		var views = workspace.getViews();

		var landscapes = new ArrayList<ViewResponse>();
		for (var view : views.getSystemLandscapeViews()) {
			landscapes.add(new ViewResponse(
					view.getKey(),
					view.getName(),
					view.getDescription()));
		}

		var contexts = new ArrayList<ViewResponse>();
		for (var view : views.getSystemContextViews()) {
			contexts.add(new ViewResponse(
					view.getKey(),
					view.getName(),
					view.getDescription()));
		}

		var containers = new ArrayList<ViewResponse>();
		for (var view : views.getContainerViews()) {
			containers.add(new ViewResponse(
					view.getKey(),
					view.getName(),
					view.getDescription()));
		}

		var components = new ArrayList<ViewResponse>();
		for (var view : views.getComponentViews()) {
			components.add(new ViewResponse(
					view.getKey(),
					view.getName(),
					view.getDescription()));
		}

		return new ViewSetResponse(landscapes, contexts, containers, components);
	}

	@GetMapping("/landscapes")
	public List<ViewResponse> allLandscapes() {
		var response = new ArrayList<ViewResponse>();
		for (var systemLandscapeView : workspace.getViews().getSystemLandscapeViews()) {
			response.add(new ViewResponse(
					systemLandscapeView.getKey(),
					systemLandscapeView.getName(),
					systemLandscapeView.getDescription()));
		}
		return response;
	}

	@GetMapping("/landscapes/{id}")
	public DiagramResponse landscape(@PathVariable("id") String id) {
		return getViewResponse(workspace.getViews().getSystemLandscapeViews(), elementHasContextView, id);
	}

	@GetMapping("/contexts/{id}")
	public DiagramResponse contexts(@PathVariable("id") String id) {
		return getViewResponse(workspace.getViews().getSystemContextViews(), elementHasContainerView, id);
	}

	@GetMapping("/containers/{id}")
	public DiagramResponse containers(@PathVariable("id") String id) {
		return getViewResponse(workspace.getViews().getContainerViews(), elementHasComponentView, id);
	}

	@GetMapping("/components/{id}")
	public DiagramResponse components(@PathVariable("id") String id) {
		return getViewResponse(workspace.getViews().getComponentViews(), new HashMap<>(), id);
	}

	private DiagramResponse getViewResponse(
			Collection<? extends StaticView> views,
			Map<String, String> links,
			String id) {
		for (var view : views) {
			if (view.getKey().equals(id)) {
				Element elmAssociatedWithView = null;
				try {
					elmAssociatedWithView = getElementAssociatedWithView(view);
				} catch (Exception e) {
					elmAssociatedWithView = null;
				}
				var rels = view.getRelationships();
				var relViews = new ArrayList<Relationship>();
				for (var rel : rels) {
					var model = rel.getRelationship();
					relViews.add(new Relationship(
							model.getId(),
							model.getSourceId(),
							model.getDestinationId(),
							model.getDescription(),
							parseTechnology(model.getTechnology()),
							model.getTagsAsSet()));
				}
				var elmViews = new ArrayList<ElementResponse>();
				for (var elementView : view.getElements()) {
					var model = elementView.getElement();
					String technology;
					try {
						var getTechnology = model.getClass().getMethod("getTechnology");
						technology = (String) getTechnology.invoke(model);
					} catch (NoSuchMethodException e) {
						technology = null;
					} catch (Exception e) {
						throw new RuntimeException(e);
					}
					var viewUrl = links.getOrDefault(model.getId(), null);
					elmViews.add(new ElementResponse(
							model.getId(),
							model.getName(),
							model.getDescription(),
							viewUrl,
							isChild(elmAssociatedWithView.getId(), model),
							parseTechnology(technology),
							model.getTagsAsSet()));
				}
				AutoLayout layout = null;
				if (view.getAutomaticLayout() != null) {
					layout = new AutoLayout(
							view.getAutomaticLayout().getRankDirection().toString(),
							view.getAutomaticLayout().getRankSeparation(),
							view.getAutomaticLayout().getNodeSeparation());
				}
				return new DiagramResponse(
						view.getKey(),
						view.getName(),
						view.getTitle(),
						layout,
						elmViews,
						relViews,
						dynamicViewsByElement.getOrDefault(elmAssociatedWithView.getId(), null));
			}
		}
		throw new RuntimeException("view was not found: %s".formatted(id));
	}

	private Element getElementAssociatedWithView(StaticView view) {
		if (view instanceof SystemLandscapeView) {
			throw new RuntimeException("system landscape view belongs no-where");
		} else if (view instanceof SystemContextView) {
			return view.getSoftwareSystem();
		} else if (view instanceof ContainerView) {
			return view.getSoftwareSystem();
		} else if (view instanceof ComponentView) {
			return ((ComponentView) view).getContainer();
		}
		throw new RuntimeException("unknown view type");
	}

	private Boolean isChild(String parentId, Element maybeChild) {
		var parent = maybeChild.getParent();
		if (parent == null) {
			return false;
		}
		return parent.getId().equals(parentId);
	}
}
