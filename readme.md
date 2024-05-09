# Peppered Asana Client Library

This TypeScript library provides a client for interacting with the Asana API. It allows you to manage tasks, update task sections.

```
import * as asana from 'asana';
import AsanaClient from 'path/to/AsanaClient';

// Initialize the client with your Asana access token
const asanaAccessToken = 'YOUR_ASANA_ACCESS_TOKEN';
const client = new AsanaClient(asanaAccessToken);

// Move task to 'In progress' section
const taskGid = 'TASK_GID';
await client.taskInProgress(taskGid);

// Move task to 'Code review' section
await client.taskToCodeReview(taskGid);

// Move task to 'Done' section
await client.taskComplete(taskGid);
```
