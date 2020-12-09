import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query {
    nodes {
      id
      label
      buildState {
        selfTime
      }
    }
  }
`;

const infoQuery = gql`
  query query {
    info {
      notSupported {
        reason
      }
    }
  }
`;

const buildsQuery = gql`
  query query {
    builds {
      id
      filePath
      time
      amountOfNodes
    }
  }
`;

const groupPluginsQuery = gql`
  query query {
    nodesByType {
      label
      time
      amountOfNodes
    }
  }
`;

const groupPluginsSearchQuery = gql`
  query query($type: String!) {
    nodesByType(type: $type) {
      label
      time
      nodes {
        id
        label
        buildState {
          selfTime
          totalTime
        }
      }
    }
  }
`;

function sortNodes(nodes, filter) {
  return nodes
    .filter((node) => {
      if (!filter) return true;
      if (filter && new RegExp(filter, "i").exec(node.label)) return true;
    })
    .sort(
      (nodeA, nodeB) => nodeB.buildState.selfTime - nodeA.buildState.selfTime
    );
}

export default class ApplicationRoute extends Route {
  queryParams = {
    pluginType: {
      refreshModel: true,
    },
    queryContext: {
      refreshModel: true,
    },
  };

  @queryManager apollo;
  @service("router") router;

  async model(params) {
    const infoResult = await this.apollo.query({ query: infoQuery }, "info");
    if (infoResult.notSupported) {
      return {
        notSupported: infoResult.notSupported,
      };
    }

    const { pluginType, queryContext } = params;

    if (queryContext === "group") {
      if (pluginType) {
        const result = await this.apollo.query(
          { query: groupPluginsSearchQuery, variables: { type: pluginType } },
          "nodesByType"
        );
        const nodes =
          result[0] && result[0].nodes ? sortNodes(result[0].nodes) : [];

        return { nodes };
      }

      const nodesByType = await this.apollo.query(
        { query: groupPluginsQuery },
        "nodesByType"
      );

      return {
        nodesByType: [...nodesByType].sort((a, b) => b.time - a.time),
      };
    }

    if (queryContext === "builds") {
      const builds = await this.apollo.query({ query: buildsQuery }, "builds");
      return { builds };
    }

    const nodes = await this.apollo.query({ query }, "nodes");

    return { nodes: sortNodes(nodes) };
  }
}
