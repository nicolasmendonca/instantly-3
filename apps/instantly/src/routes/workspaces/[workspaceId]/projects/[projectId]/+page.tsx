import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import ConfettiExplosion from "react-confetti-explosion";
import { useParams } from "react-router-dom";
import { Task } from "instantly-client";
import { useProjectTasks } from "src/features/tasks/useProjectTasks";

interface IProjectIdPageProps {}

const ProjectIdPage: React.FC<IProjectIdPageProps> = () => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const workspaceId = params.workspaceId!;
  const projectId = params.projectId!;
  const [showConfettiForTaskId, setShowConfettiForTaskId] = React.useState("");
  const { data: tasks, toggleTaskArchived } = useProjectTasks({
    workspaceId,
    projectId,
  });

  const handleTaskArchivedChange = async (task: Task) => {
    if (!tasks) return;
    setShowConfettiForTaskId(task.archived ? "" : task.id);
    toggleTaskArchived(task.id, { revalidate: false });
  };
  return (
    <Box>
      <Box
        float={{ base: "none", lg: "right" }}
        w={{ base: "full", lg: "60%" }}
        bg="cyan.900"
        py={8}
        px={{ base: 2, lg: 4 }}
        height={{ base: "none", lg: "calc(100dvh - 80px)" }}
        maxHeight={{ base: "none", lg: "calc(100dvh - 80px)" }}
        overflowY="auto"
      >
        This is the task content
      </Box>
      <Box
        float={{ base: "none", lg: "left" }}
        w={{ base: "full", lg: "40%" }}
        maxH={{ base: "none", lg: "calc(100dvh - 80px)" }}
        overflowY="auto"
      >
        <TableContainer>
          <Button size="sm" mb={4}>
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
                <Tr key={task.id}>
                  <Td textAlign="center" px={2}>
                    <Checkbox
                      isChecked={task.archived}
                      onChange={() => handleTaskArchivedChange(task)}
                    />
                    {showConfettiForTaskId === task.id && <ConfettiExplosion />}
                  </Td>
                  <Td px={2} w="full">
                    {task.title}
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
    </Box>
  );
};

export default ProjectIdPage;
