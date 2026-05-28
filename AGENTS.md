# AGENTS.md

## Project snapshot
- This is a repository template designed to provide a solid foundation for new projects with essential documentation and configuration files.
- Core components include standard documentation files: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `FAQ.md`, and `LICENSE`.
- Template structure supports both open-source and private project setups with customizable documentation patterns.
- The template follows industry best practices for repository organization and contributor guidance.
- Ready to be customized for various project types: libraries, applications, tools, or frameworks.

## How to use this template
- Click "Use this template" on GitHub to create a new repository based on this structure.
- Clone your new repository and customize the documentation files for your specific project.
- Replace placeholder content in `README.md` with your project's actual description, installation, and usage instructions.
- Update `CONTRIBUTING.md` with your project's specific contribution guidelines and development workflow.
- Modify `CHANGELOG.md` to match your project's versioning and release strategy.
- Customize `FAQ.md` with questions relevant to your domain and project.
- Review and update `LICENSE` file if needed (currently includes standard open-source license).
- Remove this `AGENTS.md` file or adapt it for your project's specific AI agent instructions.

## Local workflows and setup recommendations
- Establish consistent development environment setup instructions in the README.
- Consider adding configuration files for common tools: `.gitignore`, `.editorconfig`, linting configs.
- CI/CD workflow is pre-configured in `.github/workflows/ci.yml` with commitlint validation - customize for your project needs.
- Issue templates are available in `.github/ISSUE_TEMPLATE/` (feature requests, bug reports) - adapt to your project domain.
- Pull request template is configured in `.github/pull_request_template.md` - update with project-specific checklists.
- Conventional commit messages are enforced by CI pipeline - this enables semantic versioning and automated changelog generation.
- Renovate configuration is included (`.github/renovate.json`) for automated dependency updates.

## Documentation conventions to follow
- Keep documentation clear, concise, and up-to-date with actual project state.
- Use consistent Markdown formatting across all documentation files.
- Include code examples and practical usage scenarios where applicable.
- Maintain a welcoming tone that encourages community participation.
- Structure documentation hierarchically: README for overview, detailed guides in separate files.
- Use relative links between documentation files for better maintainability.
- Keep technical documentation close to the code it describes.

## Customization patterns and examples
- Replace `[Project Name]` placeholders with your actual project name throughout documentation.
- Update contact information, repository links, and author details.
- Customize the contributing workflow to match your team's preferences (fork vs. branch model).
- Adapt the FAQ structure to address common questions in your project's domain.
- Consider adding project-specific documentation sections: API docs, architecture guides, deployment instructions.
- Include examples relevant to your project type: code snippets, configuration samples, usage scenarios.

## Template maintenance and evolution
- When updating this template, consider backward compatibility for existing projects using it.
- Test template changes by creating a new repository and verifying all links and instructions work.
- Keep template documentation focused on common patterns rather than project-specific details.
- Maintain this AGENTS.md file with guidance for AI assistants working on projects based on this template.
- Consider versioning the template itself for better tracking of improvements and changes.
- Gather feedback from users of the template to improve structure and documentation quality.
