import React from "react";
import {
  Box,
  BoxProps,
  Button,
  Checkbox,
  Link,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import ConfettiExplosion from "react-confetti-explosion";
import { Outlet, Link as RRDLink, useParams } from "react-router-dom";
import { Project, Task, Workspace } from "instantly-client";
import { useTasks } from "./useProjectTasks";

interface IProjectIdPageProps {}

const ProjectIdPage: React.FC<IProjectIdPageProps> = () => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
    taskId?: string;
  }>();
  const dividerColor = useColorModeValue("gray.200", "gray.700");

  return (
    <>
      {params.taskId && (
        <>
          <Box
            float={{ base: "none", lg: "right" }}
            w={{ base: "full", lg: "60%" }}
            py={8}
            px={{ base: 2, lg: 4 }}
            height={{ base: "none", lg: "calc(100dvh - 80px)" }}
            maxHeight={{ base: "none", lg: "calc(100dvh - 80px)" }}
            overflowY="auto"
            borderLeftWidth="1px"
            borderLeftColor={dividerColor}
          >
            <Outlet />
          </Box>
        </>
      )}
      <Box
        maxW={params.taskId ? "none" : "container.md"}
        mx={params.taskId ? "0" : "auto"}
      >
        <TasksListPane
          workspaceId={params.workspaceId!}
          projectId={params.projectId!}
          float={{ base: "none", lg: "left" }}
          w={{ base: "full", lg: params.taskId ? "40%" : "full" }}
          maxH={{ base: "none", lg: "calc(100dvh - 80px)" }}
          overflowY="auto"
        />
      </Box>
    </>
  );
};

const TasksListPane: React.FC<
  BoxProps & {
    workspaceId: Workspace["id"];
    projectId: Project["id"];
  }
> = ({ workspaceId, projectId, ...props }) => {
  const { data: tasks, toggleTaskArchived } = useTasks({
    workspaceId,
    projectId,
  });
  const [showConfettiForTaskId, setShowConfettiForTaskId] = React.useState("");

  const handleTaskArchivedChange = async (task: Task) => {
    if (!tasks) return;
    setShowConfettiForTaskId(task.archived ? "" : task.id);
    toggleTaskArchived(task.id, { revalidate: false });
  };
  return (
    <Box {...props}>
      <TableContainer>
        <Button size="sm" mx={2} my={4}>
          Add New Task
        </Button>
        <Table>
          <Thead>
            <Tr>
              <Th px={2}></Th>
              <Th px={2}>Title</Th>
              <Th px={2}>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tasks?.map((task) => (
              <Tr key={task.id} transition="all .2s ease-in-out">
                <Td textAlign="center" px={2}>
                  <Checkbox
                    isChecked={task.archived}
                    onChange={() => handleTaskArchivedChange(task)}
                  />
                  {showConfettiForTaskId === task.id && <ConfettiExplosion />}
                </Td>
                <Td px={2} w="full">
                  <Link
                    as={RRDLink}
                    to={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`}
                    _hover={{
                      color: "cyan.700",
                      textDecoration: "underline",
                    }}
                  >
                    {task.title}
                  </Link>
                </Td>
                <Td px={2}>
                  <Tag>{task.status}</Tag>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectIdPage;
