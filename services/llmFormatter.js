// services/llmFormatter.js
class LLMFormatter {
    // Format a question with answers for LLM context
    formatQuestionWithAnswers(question, answers = []) {
        // Create a clean version of the HTML content
        const cleanHtml = (html) => {
            // Simple HTML to text conversion
            // A more robust solution would use a library like html-to-text
            return html
                .replace(/<code>([\s\S]*?)<\/code>/g, '```\n$1\n```')
                .replace(/<pre>([\s\S]*?)<\/pre>/g, '```\n$1\n```')
                .replace(/<[^>]*>/g, '')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
        };

        // Format question
        let formattedContent = `# Question: ${question.title}\n\n`;
        formattedContent += `**Tags**: ${question.tags.join(', ')}\n`;
        formattedContent += `**Score**: ${question.score} | **Views**: ${question.viewCount} | **Answers**: ${question.answerCount}\n\n`;
        formattedContent += cleanHtml(question.body) + '\n\n';

        // Format answers
        if (answers && answers.length > 0) {
            formattedContent += `## ${answers.length} Answers\n\n`;

            // Sort answers by score, with accepted answer first
            const sortedAnswers = [...answers].sort((a, b) => {
                if (a.isAccepted && !b.isAccepted) return -1;
                if (!a.isAccepted && b.isAccepted) return 1;
                return b.score - a.score;
            });

            sortedAnswers.forEach((answer, index) => {
                formattedContent += `### Answer ${index + 1}${answer.isAccepted ? ' (Accepted)' : ''}\n`;
                formattedContent += `**Score**: ${answer.score} | **Author**: ${answer.owner.name} (${answer.owner.reputation} rep)\n\n`;
                formattedContent += cleanHtml(answer.body) + '\n\n';
            });
        }

        return formattedContent;
    }

    // Format search results for LLM context
    formatSearchResults(results, query) {
        let formattedContent = `# Search Results for: "${query}"\n\n`;
        formattedContent += `Found ${results.total} results. Showing top ${results.questions.length}:\n\n`;

        results.questions.forEach((q, i) => {
            formattedContent += `## ${i + 1}. ${q.title}\n`;
            formattedContent += `**ID**: ${q.id} | **Score**: ${q.score} | **Answers**: ${q.answerCount}${q.isAnswered ? ' (Has accepted answer)' : ''}\n`;
            formattedContent += `**Tags**: ${q.tags.join(', ')}\n`;
            formattedContent += `**Link**: ${q.link}\n\n`;
        });

        return formattedContent;
    }

    // Format tags for LLM context
    formatTags(tags, site) {
        let formattedContent = `# Popular Tags on ${site}\n\n`;

        // Group tags by frequency ranges for better context
        const highUsage = tags.filter(t => t.count > 10000);
        const mediumUsage = tags.filter(t => t.count <= 10000 && t.count > 1000);
        const lowUsage = tags.filter(t => t.count <= 1000);

        formattedContent += `## High Usage Tags (>10,000 questions)\n`;
        highUsage.forEach(tag => {
            formattedContent += `- ${tag.name}: ${tag.count.toLocaleString()} questions\n`;
        });

        formattedContent += `\n## Medium Usage Tags (1,000-10,000 questions)\n`;
        mediumUsage.forEach(tag => {
            formattedContent += `- ${tag.name}: ${tag.count.toLocaleString()} questions\n`;
        });

        formattedContent += `\n## Lower Usage Tags (<1,000 questions)\n`;
        lowUsage.forEach(tag => {
            formattedContent += `- ${tag.name}: ${tag.count.toLocaleString()} questions\n`;
        });

        return formattedContent;
    }
}

module.exports = LLMFormatter;