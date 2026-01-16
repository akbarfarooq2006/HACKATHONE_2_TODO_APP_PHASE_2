"""
Task management endpoints.

This module provides CRUD endpoints for todo tasks with zero-trust security.
All operations are scoped to the authenticated user.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.task import Task
from app.schemas.task import (
    TaskResponse,
    TaskListResponse,
    TaskCreate,
    TaskUpdate,
)


router = APIRouter()


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> TaskListResponse:
    """
    List all tasks for the authenticated user.

    Returns tasks ordered by creation date (newest first).
    Implements zero-trust security - only returns tasks belonging to the authenticated user.

    Args:
        current_user_id: User ID from JWT token (injected by get_current_user)
        session: Database session

    Returns:
        TaskListResponse with tasks array and count
    """
    # Query tasks filtered by user_id and ordered by created_at DESC
    statement = (
        select(Task)
        .where(Task.user_id == current_user_id)
        .order_by(Task.created_at.desc())
    )
    tasks = session.exec(statement).all()

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        count=len(tasks),
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> TaskResponse:
    """
    Create a new task for the authenticated user.

    The task is automatically associated with the authenticated user and marked as incomplete.

    Args:
        task_data: Task creation data (title, optional description)
        current_user_id: User ID from JWT token (injected by get_current_user)
        session: Database session

    Returns:
        Created task with 201 status code
    """
    # Generate a new UUID for the task
    import uuid
    task_id = str(uuid.uuid4())

    # Create task instance
    task = Task(
        id=task_id,
        title=task_data.title,
        description=task_data.description,
        completed=False,
        user_id=current_user_id,
    )

    # Save to database
    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> TaskResponse:
    """
    Get a specific task by ID.

    Implements zero-trust security - only returns the task if it belongs to the authenticated user.

    Args:
        task_id: Task ID from URL path
        current_user_id: User ID from JWT token (injected by get_current_user)
        session: Database session

    Returns:
        Task details

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    # Query task with user_id filter (zero-trust security)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user_id,
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> TaskResponse:
    """
    Update a task (title, description, or completion status).

    Implements zero-trust security - only updates the task if it belongs to the authenticated user.

    Args:
        task_id: Task ID from URL path
        task_data: Task update data (optional title, description, completed)
        current_user_id: User ID from JWT token (injected by get_current_user)
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    # Query task with user_id filter (zero-trust security)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user_id,
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Apply partial update (only update provided fields)
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed

    # Save changes
    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> None:
    """
    Delete a task permanently.

    Implements zero-trust security - only deletes the task if it belongs to the authenticated user.

    Args:
        task_id: Task ID from URL path
        current_user_id: User ID from JWT token (injected by get_current_user)
        session: Database session

    Returns:
        204 No Content on success

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    # Query task with user_id filter (zero-trust security)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user_id,
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Delete task
    session.delete(task)
    session.commit()
