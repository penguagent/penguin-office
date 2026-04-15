import * as THREE from 'three';
import {
  createDesk, createChair, createComputer, createCouch,
  createPingPongTable, createTreadmill, createWaterCooler,
  createPlant, createServerRack,
} from '../furniture';
import { GRID_COLS, GRID_ROWS, DESK_POSITIONS } from '../../shared/constants';

export class Office {
  group: THREE.Group;
  private occupancyGrid: boolean[][];

  constructor() {
    this.group = new THREE.Group();
    this.occupancyGrid = Array.from({ length: GRID_ROWS }, () =>
      Array(GRID_COLS).fill(false),
    );
    this.buildFloor();
    this.buildWalls();
    this.buildFurniture();
  }

  private buildFloor() {
    // Main office floor (warm beige)
    const floorGeo = new THREE.PlaneGeometry(GRID_COLS, GRID_ROWS);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xd4b896,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(GRID_COLS / 2, 0, GRID_ROWS / 2);
    floor.receiveShadow = true;
    this.group.add(floor);

    // Gym floor (dark gray)
    const gymFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 6),
      new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6 }),
    );
    gymFloor.rotation.x = -Math.PI / 2;
    gymFloor.position.set(23, 0.01, 13);
    gymFloor.receiveShadow = true;
    this.group.add(gymFloor);

    // Grid lines for debugging / visual flair
    const gridHelper = new THREE.GridHelper(GRID_COLS, GRID_COLS, 0x666666, 0x444444);
    gridHelper.position.set(GRID_COLS / 2, 0.005, GRID_ROWS / 2);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    this.group.add(gridHelper);
  }

  private buildWalls() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.9,
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(GRID_COLS, 3, 0.15), wallMat);
    backWall.position.set(GRID_COLS / 2, 1.5, 0);
    backWall.castShadow = true;
    this.group.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3, GRID_ROWS), wallMat);
    leftWall.position.set(0, 1.5, GRID_ROWS / 2);
    leftWall.castShadow = true;
    this.group.add(leftWall);

    // Divider between desk area and gym
    const divider = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 8), wallMat);
    divider.position.set(16, 1.25, 6);
    this.group.add(divider);
  }

  private buildFurniture() {
    // Desks with computers and chairs
    DESK_POSITIONS.forEach((pos, i) => {
      const desk = createDesk(pos.gridX, pos.gridY);
      this.group.add(desk);

      const computer = createComputer(pos.gridX, 0.76, pos.gridY - 0.2);
      this.group.add(computer);

      const chair = createChair(pos.gridX, pos.gridY + 0.8);
      chair.rotation.y = Math.PI;
      this.group.add(chair);

      this.markOccupied(pos.gridX - 1, pos.gridY - 1, 3, 2);

      // Only mark first 6 desks
      if (i < 6) {
        this.occupancyGrid[Math.floor(pos.gridY)]![Math.floor(pos.gridX)] = true;
      }
    });

    // Break room
    const couch = createCouch(5, 15);
    this.group.add(couch);
    this.markOccupied(4, 14, 3, 2);

    const waterCooler = createWaterCooler(9, 14);
    this.group.add(waterCooler);

    const pingPong = createPingPongTable(6, 18);
    this.group.add(pingPong);
    this.markOccupied(4, 17, 5, 3);

    // Gym
    const treadmill1 = createTreadmill(20, 12);
    this.group.add(treadmill1);

    const treadmill2 = createTreadmill(23, 12);
    this.group.add(treadmill2);

    // Plants
    const plantPositions = [[1, 1], [15, 1], [1, 11], [28, 1], [28, 18]];
    plantPositions.forEach(([px, pz]) => {
      const plant = createPlant(px!, pz!);
      this.group.add(plant);
    });

    // Server room
    for (let i = 0; i < 3; i++) {
      const rack = createServerRack(3 + i * 1.5, 22);
      this.group.add(rack);
    }
  }

  private markOccupied(startX: number, startY: number, w: number, h: number) {
    for (let y = startY; y < startY + h && y < GRID_ROWS; y++) {
      for (let x = startX; x < startX + w && x < GRID_COLS; x++) {
        if (y >= 0 && x >= 0) {
          this.occupancyGrid[y]![x] = true;
        }
      }
    }
  }

  isWalkable(gridX: number, gridY: number): boolean {
    if (gridX < 0 || gridX >= GRID_COLS || gridY < 0 || gridY >= GRID_ROWS) return false;
    return !this.occupancyGrid[gridY]![gridX];
  }

  getOccupancyGrid(): boolean[][] {
    return this.occupancyGrid;
  }
}
