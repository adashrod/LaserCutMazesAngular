import MazeGenerator from "app/algorithms/maze-generator";
import OrderedPair from "app/common/ordered-pair";
import Maze from "app/models/maze";
import Direction from "app/direction";

/**
 * Simple unidirectional tree for implementing a disjoint set
 */
class Tree {
    parent: Tree = this;

    get root(): Tree {
        return this.parent === this ? this.parent : this.parent.root;
    }

    isConnectedTo(otherTree: Tree): boolean {
        return this.root === otherTree.root;
    }

    merge(otherTree: Tree): void {
        otherTree.root.parent = this;
    }
}

/**
 * An edge is determined by the coordinates of the two spaces that it separates
 */
class Edge {
    a: OrderedPair<number>;
    b: OrderedPair<number>;

    constructor(a: OrderedPair<number>, b: OrderedPair<number>) {
        this.a = a;
        this.b = b;
    }
}

/**
 * An implementation of https://en.wikipedia.org/wiki/Kruskal%27s_algorithm for generating random 2D mazes with square
 * spaces
 * @author adashrod@gmail.com
 */
export default class KruskalsAlgorithm extends MazeGenerator {
    private parallelMatrix: Tree[][] = [];
    private edges: Edge[] = [];

    get name(): string {
        return "Kruskal's";
    }

    buildPaths(maze: Maze): void {
        this.parallelMatrix = [];
        this.edges = [];
        for (let y = 0; y < maze.numRows; y++) {
            this.parallelMatrix.push([]);
            for (let x = 0; x < maze.numCols; x++) {
                this.parallelMatrix[y].push(new Tree());
                if (x + 1 < maze.numCols) {
                    this.edges.push(new Edge(new OrderedPair(x, y), new OrderedPair(x + 1, y)));
                }
                if (y + 1 < maze.numRows) {
                    this.edges.push(new Edge(new OrderedPair(x, y), new OrderedPair(x,     y + 1)));
                }
            }
        }
        this.shuffleEdges();
        for (const e of this.edges) {
            const s1 = e.a;
            const s2 = e.b;
            const tree1 = this.parallelMatrix[s1.y][s1.x];
            const tree2 = this.parallelMatrix[s2.y][s2.x];
            if (!tree1.isConnectedTo(tree2)) {
                tree1.merge(tree2);
                const oneToTwo = Direction.determineDirection(s1, s2);
                maze.grid[s1.y][s1.x].openWall(oneToTwo);
                maze.grid[s2.y][s2.x].openWall(oneToTwo.opposite);
            }
        }
    }

    private shuffleEdges(): void {
        for (let i = 0; i < this.edges.length - 1; i++) {
            const randIndex = this.rng(this.edges.length - i) + i;
            const temp = this.edges[i];
            this.edges[i] = this.edges[randIndex];
            this.edges[randIndex] = temp;
        }
    }
}
